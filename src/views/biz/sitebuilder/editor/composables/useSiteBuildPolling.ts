import { ref, type Ref } from "vue";
import type { SiteBuild, SiteBuildEvent } from "@/views/biz/sitebuilder/types";

/** 体验版构建状态容器：不轮询、不读写正式任务或浏览器任务缓存。 */
export function useSiteBuildPolling(_projectId: Ref<number>, _onTerminal?: () => void) {
  const build = ref<SiteBuild>();
  const events = ref<SiteBuildEvent[]>([]);
  const buildLoading = ref(false);

  const startPolling = (_buildId: number) => undefined;
  const stopPolling = () => undefined;
  const restore = () => false;
  const clear = () => {
    build.value = undefined;
    events.value = [];
  };

  return { build, events, buildLoading, startPolling, stopPolling, restore, clear };
}
