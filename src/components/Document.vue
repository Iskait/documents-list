<script setup lang="ts">
import { computed, inject, provide, Ref, ref, watch } from "vue";
import DocumentItem from "./DocumentItem.vue";
import { Category, CategoryDocument } from "../types/Documents";
import Arrow from "@/assets/arrow.svg?component";
import Edit from "@/assets/edit.svg?component";
import Move from "@/assets/move.svg?component";
import Trash from "@/assets/trash.svg?component";

const props = defineProps<{
  /** Заголовок */
  title: string;
  /** ID */
  id: number;
  /** Описание */
  description: string;
  /** Перечень документов */
  items: {
    id: number;
    title: string;
    description: string;
  }[];
}>();

/** Инъекция поиска */
const search = inject("search") as Ref<string>;

/** Инъекция данных */
const documents = inject("documents") as Ref<Category[]>;

/** Инъекция неиспользуемых данных */
const stash = inject("stash") as Ref<CategoryDocument[]>;

/** Текущий индекс категории */
const currentIndex = computed(() =>
  documents.value.findIndex((document) => document.id === props.id)
);

/** Предоставляем доступ дочерним компонентам DocumentItem */
provide("currentIndex", currentIndex);

/** Показывать ли перечень документов */
const showDocuments = ref(false);

/** Можно ли перемещать элемент (перемещение возможно при удерживании кнопки Move) */
const draggable = ref(false);

/**
 * Эта функция срабатывает при начале переноса элемента
 *
 * @param event - Событие, возникающее при начале переноса элемента
 * @param documentIndex - Текущий индекс документа в массиве
 */
const dragStart = (event: DragEvent, documentIndex: number) => {
  event.dataTransfer!.dropEffect = "move";
  event.dataTransfer!.effectAllowed = "move";

  /** Передаем в значение `document` его текущий индекс */
  event.dataTransfer?.setData("document", documentIndex.toString());
};

/**
 * Эта функция срабатывает при сбросе на элемент
 *
 * @param event - Событие, возникающее при сбросе на элемент
 * @param documentIndex - Текущий индекс документа в массиве
 */
const onDrop = (event: DragEvent, documentIndex: number) => {
  if (event.dataTransfer?.getData("document")) {
    /** Если сбрасывается документ */

    /** Индекс переносимого документа */
    const draggableIndex = +event.dataTransfer?.getData("document");

    /** Переносимый документ */
    const draggableDocument = documents.value.splice(draggableIndex, 1)[0];

    /** Добавление документа в массив */
    documents.value.splice(documentIndex, 0, draggableDocument);
  } else if (event.dataTransfer?.getData("documentItem")) {
    /** Если сбрасывается элемент из перечня документов */

    /** Извлечение индекса документа, с которого происходит перенос и индекса элемента из перечня документов */
    const { draggableIndex, itemIndex } = JSON.parse(
      event.dataTransfer?.getData("documentItem") as string
    );

    /** Сбрасываемый элемент перечня документов */
    const documentItem = documents.value[draggableIndex].items.splice(
      itemIndex,
      1
    )[0];

    /** Добавление элемента в массив */
    documents.value[documentIndex].items.unshift(documentItem);
  } else {
    /** Если элемент сбрасывается из `stash` */

    /** Извлекаем индекс перетаскиваемого элемента в массиве stash  */
    const itemIndex = +(event.dataTransfer?.getData(
      "documentStashItem"
    ) as string);

    /** Перетаскиваемый элемент */
    const documentStashItem = stash.value.splice(itemIndex, 1)[0];

    /** Добавление элемента в массив */
    documents.value[documentIndex].items.unshift(documentStashItem);
  }
};

// Если в перечне документов присутствует подстрока из поиска, то они показываются
watch(search, (newValue) => {
  showDocuments.value =
    props.items.some((item) => new RegExp(newValue, "i").test(item.title)) &&
    newValue.length > 1;
});
</script>

<template>
  <div class="flex flex-col">
    <div
      class="flex items-center justify-between border p-4"
      :draggable="draggable"
      @dragstart="dragStart($event, currentIndex)"
      @drop.prevent="onDrop($event, currentIndex)"
      @dragenter.prevent
      @dragover.prevent
    >
      <div class="flex items-center gap-x-3">
        <button
          class="rounded-full border border-[#D3D8DF] p-2"
          @click="showDocuments = !showDocuments"
        >
          <Arrow
            class="transition-transform duration-300"
            :class="{ 'rotate-180': showDocuments }"
          />
        </button>
        <h3>
          {{ title }}
        </h3>
        <p class="text-xs text-[#8E9CBB]">
          {{ description }}
        </p>
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
    <div
      class="origin-top transition-all duration-500"
      :class="[
        showDocuments ? 'max-h-screen scale-y-100' : 'max-h-0 scale-y-0',
      ]"
    >
      <transition-group name="list" tag="div">
        <DocumentItem
          v-for="item in items"
          :key="item.id"
          :title="item.title"
          :description="item.description"
          :id="item.id"
          :is-in-stash="false"
        />
      </transition-group>
    </div>
  </div>
</template>
