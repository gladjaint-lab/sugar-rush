// Підключення функціоналу "Чертоги Фрілансера"
import { FLS } from "@js/common/functions.js";
// Підключення доповнення
import { Loader } from '@googlemaps/js-api-loader';
// Підключення налаштувань
import { MAP_STYLES, BREAKPOINTS, MAP_KEY } from './_settings.js';

import './map.scss'

function mapInit() {
	const SELECTORS = {
		section: '[data-fls-map]',
		marker: '[data-fls-map-marker]',
		map: '[data-fls-map-body]',
	};
	const $sections = document.querySelectorAll(SELECTORS.section);
	if (!$sections.length) return;
	const loadMap = async (onLoad) => {
		const loader = new Loader({
			apiKey: MAP_KEY,
			version: 'weekly',
			libraries: ['places'],
		});
		try {
			const { Map } = await loader.importLibrary('maps');
			const { AdvancedMarkerElement } = await loader.importLibrary('marker');
			const Core = await loader.importLibrary('core');
			onLoad({ Map, AdvancedMarkerElement, Core });
		} catch (e) {
			FLS('_FLS_MAP_ERROR');
			console.log(e);
		}
	};
	const initMap = async ({ api, lng, lat, markersData, zoom, maxZoom, $map }) => {
		const mapOptions = {
			maxZoom,
			zoom,
			mapTypeControl: false,
			styles: MAP_STYLES,
			center: {
				lat,
				lng,
			},
			disableDefaultUI: true,
			mapId: "DEMO_MAP_ID"
		};

		const map = new api.Map($map, mapOptions);

		const markerDesktopSize = { width: 40, height: 57 };
		const markerMobileSize = { width: 30, height: 42 };

		// Розмір маркерів
		const markerSize = window.innerWidth < BREAKPOINTS.tablet ? markerMobileSize : markerDesktopSize;
		const markers = await markersData.map(({ lat, lng, icon, title, markerZoom, markerPopup }) => {
			let image
			if (icon) {
				image = document.createElement("img")
				image.src = icon
			}
			const marker = new api.AdvancedMarkerElement({
				map,
				title: title,
				gmpClickable: true,
				position: new api.Core.LatLng(lat, lng),
				content: icon ? image : null,
			});

			marker.addEventListener('gmp-click', () => {
				markerZoom.enable ? map.setZoom(+markerZoom.value || 10) : null
				if (markerPopup.enable && window.flsPopup) {
					window.flsPopup.open(markerPopup.value)
				}
				map.panTo(marker.position)
			})

			return marker;
		});
		return map;
	};
	loadMap((api) => {
		$sections.forEach(($section) => {
			const $maps = $section.querySelectorAll(SELECTORS.map);
			if (!$maps.length) return;

			$maps.forEach(($map) => {
				const $markers = $map.parentElement.querySelectorAll(SELECTORS.marker);
				const markersData = Array.from($markers).map(($marker) => ({
					lng: parseFloat($marker.dataset.flsMapLng) || 0,
					lat: parseFloat($marker.dataset.flsMapLat) || 0,
					icon: $marker.dataset.flsMapIcon,
					title: $marker.dataset.flsMapTitle,
					markerZoom: {
						enable: $marker.hasAttribute('data-fls-map-marker-zoom'),
						value: $marker.dataset.flsMapMarkerZoom,
					},
					markerPopup: {
						enable: $marker.hasAttribute('data-fls-map-marker-popup'),
						value: $marker.dataset.flsMapMarkerPopup,
					}
				}));
				const map = initMap({
					api,
					$map,
					lng: parseFloat($map.dataset.flsMapLng) || 0,
					lat: parseFloat($map.dataset.flsMapLat) || 0,
					zoom: parseFloat($map.dataset.flsMapZoom) || 6,
					maxZoom: parseFloat($map.dataset.flsMapMaxZoom) || 18,
					markersData,
				});
			});
		});
	});
}
document.querySelector('[data-fls-map]') ?
	window.addEventListener('load', mapInit) : null