<script setup lang="ts">
import { inject, Ref } from "vue";
import { Category, CategoryDocument } from "../types/Documents";
import DocumentItem from "./DocumentItem.vue";

/** Инъекция всех данных */
const documents = inject("documents") as Ref<Category[]>;

/** Инъекция неиспользуемых данных */
const stash = inject("stash") as Ref<CategoryDocument[]>;

/**
 * Эта фукнция срабатывает если в массиве с неиспользуемыми данными пуст
 * и переносимый элемент из перечня документов.
 * Для документов функция не срабатывает, а при наличии элементов в массиве
 * onDrop отрабатывает на DocumentItem
 * @param event - Событие, возникающее при сбросе на элемент
 */
const onDrop = (event: DragEvent) => {
  if (event.dataTransfer?.getData("documentItem") && !stash.value.length) {
    /** Если перемещаемый элемент из перечня документов и в массив с неиспользуемыми данными пуст */
    const { draggableIndex, itemIndex } = JSON.parse(
      event.dataTransfer?.getData("documentItem")
    );
    /** Сбрасываемый элемент перечня документов */
    const draggableItem = documents.value[draggableIndex].items.splice(
      itemIndex,
      1
    )[0];
    /** Добавляем элемент в начало массива */
    stash.value.push(draggableItem);
  }
};
</script>

<template>
  <div
    class="flex min-h-[50px] flex-col gap-y-3 border border-black/50 transition"
    @drop.prevent="onDrop($event)"
    @dragenter.prevent
    @dragover.prevent
  >
    <transition-group name="list" tag="div">
      <DocumentItem
        v-for="item in stash"
        :key="item.title"
        :title="item.title"
        :description="item.description"
        :id="item.id"
        class="ml-0"
        :is-in-stash="true"
      />
    </transition-group>
  </div>
</template>
