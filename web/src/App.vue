<script setup>
import { onMounted, reactive, ref } from 'vue'

const loadingFeatured = ref(false)
const loadingSearch = ref(false)
const errorMessage = ref('')

const featuredRecipes = ref([])
const searchResults = ref([])

const searchQuery = ref('')

const nutritionSummary = reactive({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
})

const selectedRecipeIds = ref([])

function handleError(e) {
  console.error(e)
  errorMessage.value = e?.message || '请求失败，请稍后重试'
}

async function fetchFeaturedRecipes() {
  loadingFeatured.value = true
  errorMessage.value = ''
  try {
    const res = await fetch('/api/recipes/featured')
    if (!res.ok) {
      throw new Error('获取精选菜谱失败')
    }
    const data = await res.json()
    if (data.code !== 0) {
      throw new Error(data.message || '获取精选菜谱失败')
    }
    featuredRecipes.value = data.data || []
  } catch (e) {
    handleError(e)
  } finally {
    loadingFeatured.value = false
  }
}

async function searchRecipes() {
  if (!searchQuery.value.trim()) {
    return
  }
  loadingSearch.value = true
  errorMessage.value = ''
  try {
    const params = new URLSearchParams({ query: searchQuery.value.trim() })
    const res = await fetch(`/api/recipes/search?${params.toString()}`)
    if (!res.ok) {
      throw new Error('搜索菜谱失败')
    }
    const data = await res.json()
    if (data.code !== 0) {
      throw new Error(data.message || '搜索菜谱失败')
    }
    searchResults.value = data.data || []
  } catch (e) {
    handleError(e)
  } finally {
    loadingSearch.value = false
  }
}

function toggleSelectRecipe(id) {
  const index = selectedRecipeIds.value.indexOf(id)
  if (index === -1) {
    selectedRecipeIds.value.push(id)
  } else {
    selectedRecipeIds.value.splice(index, 1)
  }
}

async function analyzeNutrition() {
  if (!selectedRecipeIds.value.length) {
    errorMessage.value = '请先选择至少一个菜谱'
    return
  }
  errorMessage.value = ''
  try {
    const res = await fetch('/api/nutrition/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipeIds: selectedRecipeIds.value }),
    })
    if (!res.ok) {
      throw new Error('营养分析失败')
    }
    const data = await res.json()
    if (data.code !== 0) {
      throw new Error(data.message || '营养分析失败')
    }
    Object.assign(nutritionSummary, data.data || {})
  } catch (e) {
    handleError(e)
  }
}

onMounted(() => {
  fetchFeaturedRecipes()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50/80 text-slate-900 font-sans">
    <div
      class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,#fdf5ff_0,#f9fbff_35%,#f5fff8_70%,#ffffff_100%)]"
    />

    <div class="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-6 pt-5 sm:px-6 lg:px-8">
      <header class="mb-4 text-center sm:mb-6">
        <h1 class="text-xl font-semibold tracking-[0.18em] text-slate-800 sm:text-2xl">
          智能菜谱助手 · WEB
        </h1>
        <p class="mt-2 text-xs text-slate-500 sm:text-sm">
          精选菜谱 · 智能搜索 · 快速营养估算
        </p>
      </header>

      <main
        class="grid flex-1 grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-5 lg:gap-6"
      >
        <section
          class="col-span-full rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-4"
        >
          <h2 class="mb-3 text-base font-semibold text-slate-800 sm:text-lg">
            搜索菜谱
          </h2>
          <form
            class="flex flex-col gap-3 sm:flex-row"
            @submit.prevent="searchRecipes"
          >
            <div class="relative flex-1">
              <input
                v-model="searchQuery"
                type="text"
                class="w-full rounded-full border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-800 shadow-[0_0_0_1px_rgba(148,163,184,0.15)] outline-none transition focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_1px_rgba(79,70,229,0.45)] focus:ring-0 sm:text-[13px]"
                placeholder="试试输入：宫保鸡丁、牛肉、番茄炒蛋..."
              />
              <span
                class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-slate-400 sm:right-3.5"
              >
                回车搜索
              </span>
            </div>
            <button
              type="submit"
              :disabled="loadingSearch"
              class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-xs font-medium text-white shadow-md shadow-indigo-500/40 transition hover:brightness-105 hover:shadow-lg hover:shadow-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none sm:text-sm"
            >
              {{ loadingSearch ? '搜索中...' : '搜索菜谱' }}
            </button>
          </form>
        </section>

        <section
          class="rounded-2xl border border-slate-200/70 bg-white/85 p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-4"
        >
          <div class="mb-2 flex items-center justify-between gap-2">
            <h2 class="text-base font-semibold text-slate-800 sm:text-lg">
              精选菜谱
            </h2>
            <button
              type="button"
              :disabled="loadingFeatured"
              @click="fetchFeaturedRecipes"
              class="inline-flex items-center gap-1 rounded-full bg-transparent px-2 py-1 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:text-xs"
            >
              <span class="hidden sm:inline">{{ loadingFeatured ? '刷新中...' : '换一批推荐' }}</span>
              <span class="sm:hidden">{{ loadingFeatured ? '刷新中' : '换一批' }}</span>
            </button>
          </div>

          <div
            v-if="featuredRecipes.length"
            class="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          >
            <article
              v-for="recipe in featuredRecipes"
              :key="recipe.id"
              class="group rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 shadow-sm shadow-slate-200/80 transition hover:-translate-y-0.5 hover:border-indigo-400/70 hover:bg-white hover:shadow-[0_10px_24px_rgba(79,70,229,0.18)]"
            >
              <h3 class="mb-1 text-sm font-semibold text-slate-800">
                <label class="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    :value="recipe.id"
                    :checked="selectedRecipeIds.includes(recipe.id)"
                    @change="toggleSelectRecipe(recipe.id)"
                    class="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-1 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span class="line-clamp-1 group-hover:text-indigo-700">{{ recipe.title }}</span>
                </label>
              </h3>

              <p class="mb-1 min-h-[1.5rem] text-[11px] text-slate-400">
                <span
                  v-for="tag in recipe.tags || []"
                  :key="tag"
                  class="mr-1 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700"
                >
                  {{ tag }}
                </span>
              </p>

              <p class="line-clamp-2 text-[12px] leading-snug text-slate-600">
                {{ recipe.description || '这道菜暂无介绍，但一定很好吃。' }}
              </p>
            </article>
          </div>
          <p
            v-else
            class="mt-1.5 text-xs text-slate-400"
          >
            暂无数据，请点击右上角“换一批推荐”试试。
          </p>
        </section>

        <section
          class="rounded-2xl border border-slate-200/70 bg-white/85 p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-4"
        >
          <h2 class="mb-2 text-base font-semibold text-slate-800 sm:text-lg">
            搜索结果
          </h2>
          <div
            v-if="searchResults.length"
            class="grid grid-cols-1 gap-2.5 md:grid-cols-2"
          >
            <article
              v-for="recipe in searchResults"
              :key="recipe.id"
              class="group rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 shadow-sm shadow-slate-200/80 transition hover:-translate-y-0.5 hover:border-indigo-400/70 hover:bg-white hover:shadow-[0_10px_24px_rgba(79,70,229,0.18)]"
            >
              <h3 class="mb-1 text-sm font-semibold text-slate-800">
                <label class="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    :value="recipe.id"
                    :checked="selectedRecipeIds.includes(recipe.id)"
                    @change="toggleSelectRecipe(recipe.id)"
                    class="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-1 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span class="line-clamp-1 group-hover:text-indigo-700">{{ recipe.title }}</span>
                </label>
              </h3>
              <p class="mb-1 min-h-[1.5rem] text-[11px] text-slate-400">
                <span
                  v-for="tag in recipe.tags || []"
                  :key="tag"
                  class="mr-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700"
                >
                  {{ tag }}
                </span>
              </p>
              <p class="line-clamp-2 text-[12px] leading-snug text-slate-600">
                {{ recipe.description || '暂无详细描述，欢迎根据食材自由发挥。' }}
              </p>
            </article>
          </div>
          <p
            v-else
            class="mt-1.5 text-xs text-slate-400"
          >
            暂无搜索结果，可以在上方输入菜名试试。
          </p>
        </section>

        <section
          class="col-span-full rounded-2xl border border-slate-200/70 bg-white/85 p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-4"
        >
          <div class="mb-2 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <h2 class="text-base font-semibold text-slate-800 sm:text-lg">
              营养估算
            </h2>
            <button
              type="button"
              @click="analyzeNutrition"
              class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-slate-50 shadow-sm shadow-slate-900/40 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md hover:shadow-slate-900/50 sm:text-sm"
            >
              估算所选菜谱营养
            </button>
          </div>

          <p class="mb-3 text-[11px] text-slate-500 sm:text-xs">
            在“精选菜谱”或“搜索结果”中勾选任意多个菜谱，然后点击按钮，后端会用一个简化模型帮你估算总热量与营养。
          </p>

          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            <div
              class="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 shadow-sm sm:text-[13px]"
            >
              <div class="text-[11px] font-medium text-slate-500">热量</div>
              <div class="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                {{ nutritionSummary.calories }}
                <span class="ml-0.5 text-[10px] font-normal text-slate-400">kcal</span>
              </div>
            </div>
            <div
              class="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 shadow-sm sm:text-[13px]"
            >
              <div class="text-[11px] font-medium text-slate-500">蛋白质</div>
              <div class="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                {{ nutritionSummary.protein }}
                <span class="ml-0.5 text-[10px] font-normal text-slate-400">g</span>
              </div>
            </div>
            <div
              class="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 shadow-sm sm:text-[13px]"
            >
              <div class="text-[11px] font-medium text-slate-500">碳水</div>
              <div class="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                {{ nutritionSummary.carbs }}
                <span class="ml-0.5 text-[10px] font-normal text-slate-400">g</span>
              </div>
            </div>
            <div
              class="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 shadow-sm sm:text-[13px]"
            >
              <div class="text-[11px] font-medium text-slate-500">脂肪</div>
              <div class="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                {{ nutritionSummary.fat }}
                <span class="ml-0.5 text-[10px] font-normal text-slate-400">g</span>
              </div>
            </div>
            <div
              class="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 shadow-sm sm:text-[13px]"
            >
              <div class="text-[11px] font-medium text-slate-500">膳食纤维</div>
              <div class="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                {{ nutritionSummary.fiber }}
                <span class="ml-0.5 text-[10px] font-normal text-slate-400">g</span>
              </div>
            </div>
            <div
              class="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 shadow-sm sm:text-[13px]"
            >
              <div class="text-[11px] font-medium text-slate-500">糖</div>
              <div class="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                {{ nutritionSummary.sugar }}
                <span class="ml-0.5 text-[10px] font-normal text-slate-400">g</span>
              </div>
            </div>
            <div
              class="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 shadow-sm sm:text-[13px]"
            >
              <div class="text-[11px] font-medium text-slate-500">钠</div>
              <div class="mt-1 text-sm font-semibold text-slate-900 sm:text-base">
                {{ nutritionSummary.sodium }}
                <span class="ml-0.5 text-[10px] font-normal text-slate-400">mg</span>
              </div>
            </div>
          </div>

          <p
            v-if="errorMessage"
            class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 sm:text-[13px]"
          >
            {{ errorMessage }}
          </p>
        </section>
      </main>

      <footer class="mt-3 text-center text-[11px] text-slate-400 sm:mt-4 sm:text-xs">
        浏览器 Web 版 · 使用本地 Node 后端
      </footer>
    </div>
  </div>
</template>
