import { DirectiveBinding, VNode } from "vue";

function elementOffsetHeight(vnode: VNode) {
  return (
    (vnode.children as VNode[]).reduce(
      (acc, val) => acc + (val.el as HTMLDivElement).offsetHeight,
      0
    ) + "px"
  );
}

export default {
  mounted: (
    el: HTMLDivElement,
    binding: DirectiveBinding<boolean>,
    vnode: VNode
  ) => {
    el.style.height = binding.value ? elementOffsetHeight(vnode) : "0px";
  },
  updated: (
    el: HTMLDivElement,
    binding: DirectiveBinding<boolean>,
    vnode: VNode
  ) => {
    el.style.height = binding.value ? elementOffsetHeight(vnode) : "0px";
  },
};
