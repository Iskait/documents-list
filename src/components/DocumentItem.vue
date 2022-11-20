<script setup lang="ts">
import { ComputedRef, inject, Ref, ref } from "vue";
import { Category, CategoryDocument } from "@/types/Documents";
import Edit from "@/assets/edit.svg?component";
import Move from "@/assets/move.svg?component";
import Trash from "@/assets/trash.svg?component";

const props = defineProps<{
  /** Название */
  title: string;
  /** Описание */
  description: string;
  /** ID */
  id: number;
  /** Находится ли элемент в `stash` */
  isInStash: boolean;
}>();

/** Инъекция поиска */
const search = inject("search") as Ref<string>;

/** Инъекция данных */
const documents = inject("documents") as Ref<Category[]>;

/** Инъекция неиспользуемых данных */
const stash = inject("stash") as Ref<CategoryDocument[]>;

/** Если документ не в stash, то получаем индекс перечня массива с данными в полном списке документов */
const currentIndex = props.isInStash
  ? null
  : (inject("currentIndex") as ComputedRef<number>);

/** Можно ли перемещать элемент (перемещение возможно при удерживании кнопки Move) */
const draggable = ref(false);

/** Наведен ли перемещаемый предмет */
const dragEnter = ref(false);

/**
 * Эта функция срабатывает при начале переноса элемента
 *
 * @param event - Событие, возникающее при начале переноса элемента
 * @param itemID - ID элемента перечня документов, для определения его индекса
 */
const dragStart = (event: DragEvent, itemID: number) => {
  event.dataTransfer!.dropEffect = "move";
  event.dataTransfer!.effectAllowed = "move";
  if (!props.isInStash) {
    /** Если элемент не в stash */

    /** Индекс переносимого элемента */
    const itemIndex = documents.value[currentIndex!.value].items.findIndex(
      (item) => item.id === itemID
    );

    /** Передаем данные в поле documentItem с текущим индексом и индексом элемента в перечне документов */
    event.dataTransfer?.setData(
      "documentItem",
      JSON.stringify({ draggableIndex: currentIndex?.value, itemIndex })
    );
  } else {
    /** Индекс переносимого элемента */
    const itemIndex = stash.value.findIndex((item) => item.id === itemID);

    /** Передаем только индекс элемента */
    event.dataTransfer?.setData("documentStashItem", itemIndex.toString());
  }
};

/**
 * Эта функция срабатывает при сбросе на элемент
 *
 * @param event - Событие, возникающее при сбросе на элемент
 * @param id - id элемента, на который осуществляется сброс
 */
const onDrop = (event: DragEvent, id: number) => {
  if (event.dataTransfer?.getData("documentItem") && !props.isInStash) {
    /** Если сбрасывается элемент из перечня документов и он не находится в stash */

    /** Извлечение индекса документа, с которого происходит перенос и индекса элемента из перечня документов */
    const { draggableIndex, itemIndex } = JSON.parse(
      event.dataTransfer?.getData("documentItem")
    );

    /** Индекс элемента на который происходит сброс */
    const dropIndex = documents.value[currentIndex!.value].items.findIndex(
      (item) => item.id === id
    );

    /** Сбрасываемый элемент из перечня документов */
    const draggableItem = documents.value[draggableIndex].items.splice(
      itemIndex,
      1
    )[0];

    /** Добавление элемента в массив с индекса элемента, на который произведен сброс */
    documents.value[currentIndex!.value].items.splice(
      dropIndex,
      0,
      draggableItem
    );
  } else if (event.dataTransfer?.getData("documentItem")) {
    /** Если сбрасывается элемент из перечня документов и он в stash */

    /** Извлечение индекса документа, с которого происходит перенос и индекса элемента из перечня документов */
    const { draggableIndex, itemIndex } = JSON.parse(
      event.dataTransfer?.getData("documentItem")
    );

    /** Индекс элемента на который сбрасывается */
    const dropIndex = stash.value.findIndex((item) => item.id === id);

    /** Сбрасываемый элемент перечня документов */
    const draggableItem = documents.value[draggableIndex].items.splice(
      itemIndex,
      1
    )[0];

    /** Добавление элемента в массив с индекса элемента, на который произведен сброс */
    stash.value.splice(dropIndex, 0, draggableItem);
  } else if (event.dataTransfer?.getData("documentStashItem")) {
    /** Если сбрасывается элемент из перечня документов из stash  */

    /** Индекс перетаскиваемого элемента */
    const documentStashIndex = +(event.dataTransfer?.getData(
      "documentStashItem"
    ) as string);

    /** Индекс элемента, на который сбрасывается */
    const droppableIndex = stash.value.findIndex((item) => item.id === id);

    /** Перетаскиваемый элемент */
    const documentStashItem = stash.value.splice(documentStashIndex, 1)[0];

    if (props.isInStash) {
      /** Если сброс производится на элемент перечня документов в stash */

      /** Добавление элемента в массив с индекса элемента, на который произведен сброс */
      stash.value.splice(droppableIndex, 0, documentStashItem);
    } else {
      /** Если сброс производится в другую категорию документов */

      /** Добавление элемента в массив с индекса элемента, на который произведен сброс */
      documents.value[currentIndex!.value].items.splice(
        droppableIndex,
        0,
        documentStashItem
      );
    }
  }
};
</script>

<template>
  <div
    class="ml-4 flex items-center justify-between border p-4 transition-all"
    :class="{ 'bg-slate-400/30': dragEnter }"
    :draggable="draggable"
    @dragstart="dragStart($event, id)"
    @drop.prevent="onDrop($event, id), (dragEnter = false)"
    @dragenter.prevent="dragEnter = true"
    @dragleave.prevent="dragEnter = false"
    @dragover.prevent
  >
    <div class="-z-10 flex items-center gap-x-3">
      <h3
        :class="{
          'text-green-500':
            new RegExp(search, 'i').test(title) && search.length > 1,
        }"
      >
        {{ title }}
      </h3>
      <p class="text-xs text-[#8E9CBB]">{{ description }}</p>
    </div>
    <div class="flex gap-x-2">
      <Edit />
      <Trash />
      <Move
        class="cursor-pointer"
        @mouseup="draggable = false"
        @mousedown="draggable = true"
      />
    </div>
  </div>
</template>
