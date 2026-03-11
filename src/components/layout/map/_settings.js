export const MAP_KEY = ``
export const BREAKPOINTS = {
	tablet: 991.98,
	mobile: 767.98,
	smallMobile: 479.98,
	xsMobile: 320,
}
export const MAP_STYLES = [
	{
		featureType: 'administrative',
		elementType: 'labels.text.fill',
		stylers: [
			{
				color: '#B1AEAE',
			},
		],
	},
	{
		featureType: 'landscape',
		elementType: 'all',
		stylers: [
			{
				color: '#E5E2E2',
			},
		],
	},
	{
		featureType: 'poi',
		elementType: 'labels.icon',
		stylers: [
			{
				saturation: -100,
			},
			{
				lightness: 45,
			},
		],
	},
	{
		featureType: 'poi',
		elementType: 'labels.text',
		stylers: [
			{
				visibility: 'off',
			},
		],
	},
	{
		featureType: 'road',
		elementType: 'geometry.fill',
		stylers: [
			{
				color: '#D6D3D3',
			},
		],
	},
	{
		featureType: 'road',
		elementType: 'geometry.stroke',
		stylers: [
			{
				color: '#CECBCB',
			},
		],
	},
	{
		featureType: 'road',
		elementType: 'labels.text.fill',
		stylers: [
			{
				color: '#B0AEAE',
			},
		],
	},
	{
		featureType: 'road',
		elementType: 'labels.text.stroke',
		stylers: [
			{
				color: '#E4E1E1',
			},
		],
	},
	{
		featureType: 'road.highway',
		elementType: 'all',
		stylers: [
			{
				visibility: 'simplified',
			},
			{
				saturation: -100,
			},
		],
	},
	{
		featureType: 'road.arterial',
		elementType: 'labels.icon',
		stylers: [
			{
				visibility: 'off',
			},
		],
	},
	{
		featureType: 'transit',
		elementType: 'all',
		stylers: [
			{
				visibility: 'on',
			},
			{
				saturation: -100,
			},
			{
				lightness: 50,
			},
		],
	},
	{
		featureType: 'water',
		elementType: 'all',
		stylers: [
			{
				color: '#D0CDCD',
			},
			{
				visibility: 'on',
			},
		],
	},
];
