<script>
	import { createApp, ref } from "vue";

	// <div id="message">{{message}}</div>

	createApp({
		setup() {
			const message = ref("В кімнату заходить VUE!");
			return { message };
		},
	}).mount("#message");
</script>
