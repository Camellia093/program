<template>
  <div class="BlogTags">
    <div class="BlogTags-header">
      Blog's pigeonhole
    </div>
  </div>
  <div class="timeline-container">
    <!-- 主体内容：优化显示完整的年份、月份和文章信息 -->
    <div class="content-container">
      <div
        v-for="yearEntry in mainContent"
        :key="yearEntry.year"
        class="year-section"
        :data-year="yearEntry.year"
      >
        <div class="year-header">
          <h2>{{ yearEntry.year }}</h2>
        </div>
        <div class="months-wrapper">
          <div
            v-for="monthEntry in yearEntry.months"
            :key="monthEntry.month"
            class="month-card"
            :class="monthEntry.season"
            :data-month="monthEntry.month"
            @mouseenter="setHoveredSeason(monthEntry.season)"
            @mouseleave="clearHoveredSeason"
          >
            <div class="month-title">
              {{ getMonthName(monthEntry.month) }}
              <span class="season-badge">{{ monthEntry.season }}</span>
            </div>
            <div class="article-list">
              <div
                v-for="article in monthEntry.articles"
                :key="article.title"
                class="article-item"
                :data-date="article.date"
              >
                <time>{{ article.date }}</time>
                <h3>{{ article.title }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 季节特效 -->
  <div class="pg-season-effects">
    <!-- 春季特效 -->
    <div class="pg-spring" :class="{ 'pg-active': hoveredSeason === 'spring' }">
    </div>
    <!-- 夏季特效 -->
    <div class="pg-summer" :class="{ 'pg-active': hoveredSeason === 'summer' }">
      <div class="pg-sun"></div>
    </div>
    <!-- 秋季特效 -->
    <div class="pg-autumn" :class="{ 'pg-active': hoveredSeason === 'autumn' }">
    </div>
    <!-- 冬季特效 -->
    <div class="pg-winter" :class="{ 'pg-active': hoveredSeason === 'winter' }">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// ------------------- 类型声明 -------------------
interface Article {
  title: string;
  date: string;
  id?: string; // 可选的文章ID，用于跳转
}

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface ArchiveMonth {
  month: number;
  season: Season;
  articles: Article[];
}

interface ArchiveYear {
  year: number;
  months: ArchiveMonth[];
}

// ------------------- 静态数据 -------------------
// 包含完整季节标识的静态数据
const archivesData = [
  {
    year: 2024,
    months: [
      {
        month: 12,
        season: 'winter',
        articles: [
          { title: "blog项目的启动", date: "26", id: "article-2024-12-26" },
          { title: "springboot开篇", date: "18", id: "article-2024-03-18" }
        ]
      },
      {
        month: 8,
        season: 'summer',
        articles: [
          { title: "关于摄影的日常", date: "22", id: "article-2024-08-22" },
          { title: "关于摄影的日常", date: "18", id: "article-2024-08-18" },
          { title: "关于摄影的日常", date: "12", id: "article-2024-08-12" },
          { title: "关于摄影的日常", date: "02", id: "article-2024-08-02" }
        ]
      },
      {
        month: 3,
        season: 'spring',
        articles: [
          { title: "关于摄影的日常", date: "22", id: "article-2024-03-22" },
          { title: "关于摄影的日常", date: "19", id: "article-2024-03-19" },
          { title: "关于摄影的日常", date: "15", id: "article-2024-03-15" },
          { title: "关于摄影的日常", date: "02", id: "article-2024-03-02" }
        ]
      }
    ]
  },
  {
    year: 2023,
    months: [
      {
        month: 3,
        season: 'spring',
        articles: [
          { title: "Vue3组合式API实践", date: "25", id: "article-2023-03-25" },
          { title: "Vue3组合式API实践", date: "20", id: "article-2023-03-20" },
          { title: "Vue3组合式API实践", date: "15", id: "article-2023-03-15" },
          { title: "微服务架构设计", date: "13", id: "article-2023-03-13" }
        ]
      },
      {
        month: 7,
        season: 'summer',
        articles: [
          { title: "TypeScript进阶技巧", date: "12", id: "article-2023-07-12" }
        ]
      }
    ]
  },
  {
    year: 2022,
    months: [
      {
        month: 11,
        season: 'autumn',
        articles: [
          { title: "React性能优化", date: "25", id: "article-2022-11-25" }
        ]
      }
    ]
  }
];

// 主体内容：直接使用静态数据
const mainContent = ref<ArchiveYear[]>(archivesData as ArchiveYear[]);

// 当前季节
const currentSeason = ref<Season | null>(null);

// 鼠标悬停的季节
const hoveredSeason = ref<Season | null>(null);

// 默认显示的季节（根据主题模式）
const defaultSeason = ref<Season | null>(null);

// 活跃的季节元素计数
const activeEffectElements = ref<{ [key in Season]?: boolean }>({});

// 检测当前主题模式
const isDarkMode = () => {
  return document.documentElement.classList.contains('dark') ||
         window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// 根据主题模式设置默认季节
const setDefaultSeasonByTheme = () => {
  // 记录之前的默认季节
  const previousDefaultSeason = defaultSeason.value;

  // 设置新的默认季节
  const darkMode = isDarkMode();
  defaultSeason.value = darkMode ? 'winter' : 'spring';

  // 如果默认季节改变了，且当前没有鼠标悬停的季节（或悬停的是之前的默认季节）
  if (previousDefaultSeason !== defaultSeason.value &&
      (hoveredSeason.value === null || hoveredSeason.value === previousDefaultSeason)) {

    // 清除之前默认季节的特效
    if (previousDefaultSeason) {
      clearSeasonElements(previousDefaultSeason);
    }

    // 设置当前悬停季节为新的默认季节
    hoveredSeason.value = defaultSeason.value;

    // 创建新的默认季节特效
    createSeasonElements(defaultSeason.value);
  }
};

// 设置鼠标悬停季节
const setHoveredSeason = (season: Season) => {
  // 记录之前的季节
  const previousSeason = hoveredSeason.value;

  // 设置新的悬停季节
  hoveredSeason.value = season;

  // 清除之前的季节特效（如果不是默认季节）
  if (previousSeason && previousSeason !== defaultSeason.value) {
    clearSeasonElements(previousSeason);
  }

  // 创建新的季节特效
  createSeasonElements(season);
};

// 清除鼠标悬停季节
const clearHoveredSeason = () => {
  // 记录之前的季节
  const previousSeason = hoveredSeason.value;

  // 恢复到默认季节
  hoveredSeason.value = defaultSeason.value;

  // 如果之前的季节不是默认季节，则清除它的特效
  if (previousSeason && previousSeason !== defaultSeason.value) {
    clearSeasonElements(previousSeason);
  }

  // 确保默认季节的特效是激活的
  createSeasonElements(defaultSeason.value as Season);
};

// 清除特定季节的元素
const clearSeasonElements = (season: Season) => {
  // 标记该季节特效已清除
  activeEffectElements.value[season] = false;

  // 清除该季节的元素
  const container = document.querySelector(`.pg-${season}`);
  if (container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
};

// 创建元素方法
const createElements = (className: string, num: number, minSize: number, maxSize: number, container: string, options: {
  extraClasses?: string[];
  minDuration?: number;
  maxDuration?: number;
  randomDelay?: boolean;
  minDelay?: number;
  maxDelay?: number;
} = {}) => {
  const containerElement = document.querySelector('.' + container);
  if (!containerElement) {
    console.error(`未找到容器: .${container}`);
    return;
  }

  for (let i = 0; i < num; i++) {
    const element = document.createElement('div');
    element.classList.add(className);

    if (options.extraClasses) {
      const classIndex = Math.floor(Math.random() * options.extraClasses.length);
      element.classList.add(options.extraClasses[classIndex]);
    }

    const size = Math.random() * (maxSize - minSize) + minSize;
    element.style.width = size + 'px';
    element.style.height = size + 'px';
    element.style.left = Math.random() * 100 + '%';

    // 随机动画持续时间
    const duration = Math.random() * (options.maxDuration || 8) + (options.minDuration || 3);
    element.style.animationDuration = duration + 's';

    // 随机延迟 - 更合理的随机延迟，让元素出现更自然
    if (options.randomDelay) {
      // 减少最大延迟，让元素更快出现
      element.style.animationDelay = Math.random() * 5 + 's';
    } else if (options.minDelay !== undefined && options.maxDelay !== undefined) {
      // 使用指定的延迟范围
      element.style.animationDelay =
        (options.minDelay + Math.random() * (options.maxDelay - options.minDelay)) + 's';
    }

    // 特定元素的额外样式
    if (className === 'pg-cloud') {
      element.style.width = (size * 3) + 'px';
      element.style.height = (size * 0.6) + 'px';
      element.style.top = Math.random() * 60 + '%'; // 更广泛的分布
      element.style.animationDuration = (20 + Math.random() * 20) + 's'; // 更慢的云
    } else if (className === 'pg-butterfly') {
      element.style.animationDuration = '0.8s';
      // 蝴蝶飞行路径
      const flyPath = document.createElement('div');
      flyPath.style.position = 'absolute';
      flyPath.style.top = Math.random() * 80 + '%'; // 更广泛的分布
      flyPath.style.left = Math.random() * 80 + '%';
      flyPath.style.width = '0';
      flyPath.style.height = '0';
      flyPath.style.animation = `pgButterflyPath ${Math.random() * 20 + 15}s linear infinite`;
      flyPath.style.zIndex = '10';

      // 为蝴蝶路径添加随机延迟
      if (options.minDelay !== undefined && options.maxDelay !== undefined) {
        flyPath.style.animationDelay =
          (options.minDelay + Math.random() * (options.maxDelay - options.minDelay)) + 's';
      } else {
        flyPath.style.animationDelay = Math.random() * 5 + 's';
      }

      flyPath.appendChild(element);
      containerElement.appendChild(flyPath);
      continue;
    } else if (className === 'pg-icicle') {
      element.style.left = Math.random() * 100 + '%';
      element.style.height = (Math.random() * 60 + 30) + 'px';
      // 为冰柱添加不同的生长延迟
      element.style.animationDelay = Math.random() * 4 + 's';
    } else if (className === 'pg-snowflake') {
      // 为雪花添加不同的起始位置
      element.style.left = Math.random() * 100 + '%';
      element.style.transform = `rotate(${Math.random() * 360}deg)`;

      // 为一些雪花添加不同的动画
      if (i % 7 === 0) {
        element.style.animationName = 'pgSnowfallZigzag';
      } else if (i % 11 === 0) {
        element.style.animationName = 'pgSnowfallSlow';
      }
    } else if (className === 'pg-leaf') {
      // 为叶子添加不同的起始旋转角度
      element.style.transform = `rotate(${Math.random() * 360}deg)`;
    } else if (className === 'pg-snow-pile') {
      // 雪堆出现在底部，随机宽度和位置
      element.style.width = (50 + Math.random() * 70) + 'px';
      element.style.left = Math.random() * 100 + '%';
      element.style.bottom = '0';
      element.style.animationDelay = (Math.random() * 5 + 5) + 's'; // 雪堆会在雪花飘落一段时间后出现
    } else if (className === 'pg-petal-pile') {
      // 花瓣堆出现在底部，随机宽度和位置
      element.style.width = (40 + Math.random() * 60) + 'px';
      element.style.left = Math.random() * 100 + '%';
      element.style.bottom = '0';
      element.style.animationDelay = (Math.random() * 4 + 3) + 's'; // 花瓣堆会在花瓣飘落一段时间后出现
    } else if (className === 'pg-leaf-pile') {
      // 落叶堆出现在底部，随机宽度和位置
      element.style.width = (60 + Math.random() * 80) + 'px';
      element.style.left = Math.random() * 100 + '%';
      element.style.bottom = '0';
      element.style.animationDelay = (Math.random() * 4 + 3) + 's'; // 落叶堆会在落叶飘落一段时间后出现
    } else {
      // 其他元素都从屏幕顶部飘落，不再设置随机top
      element.style.top = '-50px';
    }

    containerElement.appendChild(element);
  }
};

// 创建季节元素方法
const createSeasonElements = (season: Season) => {
  // 如果已经有这个季节的元素，就不重复创建
  if (activeEffectElements.value[season]) {
    return;
  }

  // 清除现有元素
  const container = document.querySelector(`.pg-${season}`);
  if (!container) {
    console.error(`未找到容器: .pg-${season}`);
    return;
  }

  // 清除现有元素
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // 根据季节创建不同的元素
  switch (season) {
    case 'spring':
      createElements('pg-petal', 40, 8, 20, `pg-${season}`, {
        minDuration: 8,
        maxDuration: 15,
        randomDelay: true
      });
      createElements('pg-butterfly', 12, 20, 30, `pg-${season}`, {
        randomDelay: true
      });
      // 添加一些花朵元素
      createElements('pg-flower', 15, 10, 25, `pg-${season}`, {
        extraClasses: ['pg-pink', 'pg-yellow', 'pg-white'],
        minDuration: 10,
        maxDuration: 20,
        randomDelay: true
      });
      // 添加花瓣堆
      createElements('pg-petal-pile', 8, 60, 120, `pg-${season}`);
      break;
    case 'summer':
      createElements('pg-cloud', 8, 30, 80, `pg-${season}`, {
        minDelay: 0, // 减少前摇
        maxDelay: 2  // 减少最大延迟
      });

      // 添加一些飞鸟
      createElements('pg-bird', 6, 15, 25, `pg-${season}`, {
        minDelay: 0, // 减少前摇
        maxDelay: 2  // 减少最大延迟
      });

      // 正确创建太阳元素
      if (!container.querySelector('.pg-sun')) {
        const sunElement = document.createElement('div');
        sunElement.classList.add('pg-sun');
        container.appendChild(sunElement);
      }
      break;
    case 'autumn':
      createElements('pg-leaf', 60, 10, 25, `pg-${season}`, {
        extraClasses: ['pg-maple', 'pg-oak', 'pg-birch'],
        minDuration: 10,
        maxDuration: 20,
        minDelay: 0, // 减少前摇
        maxDelay: 2  // 减少最大延迟
      });
      // 添加一些雾气效果
      createElements('pg-mist', 5, 100, 200, `pg-${season}`, {
        minDelay: 0, // 减少前摇
        maxDelay: 1  // 减少最大延迟
      });
      // 添加落叶堆
      createElements('pg-leaf-pile', 8, 70, 140, `pg-${season}`);
      break;
    case 'winter':
      createElements('pg-snowflake', 150, 3, 10, `pg-${season}`, { // 增加雪花数量从100到150
        minDuration: 10,
        maxDuration: 25,
        randomDelay: true
      });
      createElements('pg-icicle', 15, 5, 10, `pg-${season}`);
      // 添加一些雪堆效果
      createElements('pg-snow-pile', 6, 60, 120, `pg-${season}`);
      break;
  }

  // 标记该季节特效已创建
  activeEffectElements.value[season] = true;
};

// 添加蝴蝶飞行路径动画
const addButterflyAnimation = () => {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes pgButterflyPath {
      0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
      5% { opacity: 1; }
      10% { transform: translate(30px, -30px) rotate(20deg); }
      25% { transform: translate(100px, -50px) rotate(45deg); }
      40% { transform: translate(150px, -70px) rotate(60deg); }
      50% { transform: translate(200px, -100px) rotate(90deg); }
      60% { transform: translate(150px, -120px) rotate(120deg); }
      75% { transform: translate(50px, -100px) rotate(180deg); }
      90% { transform: translate(-30px, -50px) rotate(320deg); opacity: 1; }
      100% { transform: translate(0, 0) rotate(360deg); opacity: 0; }
    }
  `;
  document.head.appendChild(styleElement);
};

// ------------------- 辅助方法 -------------------
// 根据数字返回月份英文名称
const getMonthName = (monthNumber: number): string => {
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || '';
};

// ------------------- 事件绑定 -------------------
onMounted(() => {
  // 初始化季节 - 根据当前月份设置默认季节（但不显示特效）
  const currentMonth = new Date().getMonth() + 1; // 获取当前月份 (1-12)
  if (currentMonth >= 3 && currentMonth <= 5) {
    currentSeason.value = 'spring';
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    currentSeason.value = 'summer';
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    currentSeason.value = 'autumn';
  } else {
    currentSeason.value = 'winter';
  }

  // 初始化活跃特效元素状态对象
  activeEffectElements.value = {
    spring: false,
    summer: false,
    autumn: false,
    winter: false
  };

  // 添加蝴蝶飞行路径动画
  addButterflyAnimation();

  // 设置默认季节并显示特效
  setDefaultSeasonByTheme();

  // 监听主题变化 - 使用更可靠的方式
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  // 兼容新旧API
  if (darkModeMediaQuery.addEventListener) {
    darkModeMediaQuery.addEventListener('change', setDefaultSeasonByTheme);
  } else if (darkModeMediaQuery.addListener) {
    // 旧版浏览器支持
    darkModeMediaQuery.addListener(setDefaultSeasonByTheme);
  }

  // 监听HTML类变化（用于检测手动切换主题）
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'class') {
        setDefaultSeasonByTheme();
        break;
      }
    }
  });

  observer.observe(document.documentElement, { attributes: true });
});

onBeforeUnmount(() => {
  // 移除主题变化监听器 - 兼容新旧API
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (darkModeMediaQuery.removeEventListener) {
    darkModeMediaQuery.removeEventListener('change', setDefaultSeasonByTheme);
  } else if (darkModeMediaQuery.removeListener) {
    // 旧版浏览器支持
    darkModeMediaQuery.removeListener(setDefaultSeasonByTheme);
  }
});
</script>

<style scoped>
@import '../assets/pigeonhole.css';
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');


.BlogTags {
  height: 30vh;
  display: flex;
  margin-top: 110px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;
  background: initial;
}
  
.BlogTags-header {
  font-size: 2.8rem; /* 字体大小 */
  font-weight: bold; /* 字体加粗 */
  color: white; /* 字体颜色 */
  text-align: center; /* 文本居中 */
  font-family: 'MV Boli';
}

.pad-min {
  margin-right: 5px;
  margin-left: 5px;
}

</style>
<style>
@import '../assets/season.css';

</style>