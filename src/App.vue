<script setup lang="ts">
import { provide, ref } from "vue";
import Document from "@/components/Document.vue";
import DocumentStash from "@/components/DocumentStash.vue";
import { Category, CategoryDocument } from "./types/Documents";
import BookMark from "@/assets/book-mark.svg?component";
import PlusSign from "@/assets/plus-sign.svg?component";
import SearchIcon from "@/assets/search-icon.svg?component";
import DeleteMark from "@/assets/delete-mark.svg?component";

/** Поиск */
const search = ref("");

/** Имитация получения данных с бэкэнда */
const documents = ref<Category[]>([
  {
    id: 0,
    title: "Обязательные для всех",
    description: "Документы, обязательные для всех сотрудников без исключения",
    items: [
      {
        id: 0,
        title: "Паспорт",
        description: "Для всех",
      },
      {
        id: 1,
        title: "ИНН",
        description: "Для всех",
      },
    ],
  },
  {
    id: 1,
    title: "Обязательные для трудоустройства",
    description: "Документы, без которых невозможно устроиться",
    items: [
      {
        id: 2,
        title: "Снилс",
        description: "Для всех",
      },
      {
        id: 3,
        title: "Медицинская книжка",
        description: "Для всех",
      },
    ],
  },
  {
    id: 2,
    title: "Специальные",
    description: "Документы, для определенных специальностей",
    items: [
      {
        id: 4,
        title: "Справка об отсутствии судимости",
        description: "Для всех",
      },
      {
        id: 5,
        title: "Водительские права",
        description: "Для всех",
      },
    ],
  },
]);

/** Не используемые документы */
const stash = ref<CategoryDocument[]>([]);

provide("search", search);
provide("stash", stash);
provide("documents", documents);
</script>

<template>
  <div class="flex h-screen flex-col gap-y-6 p-10">
    <header class="flex justify-between">
      <h1>Документы</h1>
      <div class="flex gap-x-3">
        <button class="btn-circle">
          <BookMark />
        </button>
        <button class="btn-circle flex items-center gap-x-3">
          <PlusSign />
          <span>Новый тип</span>
        </button>
        <button class="btn-circle flex items-center gap-x-3">
          <PlusSign />
          <span>Новый документ</span>
        </button>
      </div>
    </header>
    <main class="flex flex-grow flex-col gap-y-6">
      <div
        class="flex max-w-lg items-center gap-x-3 border-b border-blue-800 pb-2"
      >
        <SearchIcon />
        <input type="text" class="grow" v-model="search" />
        <DeleteMark v-if="search.length" />
      </div>
      <transition-group name="list" tag="div">
        <Document
          v-for="document in documents"
          :key="document.id"
          :title="document.title"
          :description="document.description"
          :items="document.items"
          :id="document.id"
        />
      </transition-group>
    </main>
    <DocumentStash />
  </div>
</template>
