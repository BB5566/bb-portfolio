<template>
  <div class="mail">
    <!-- 收件者資訊 -->
    <aside class="mail__sidebar">
      <p class="mail__sidebar-title">收件者</p>

      <div class="mail__card">
        <p class="mail__name">{{ displayName }}</p>
        <p v-if="profile?.title" class="mail__role">{{ profile.title }}</p>

        <ul class="mail__meta">
          <li v-if="profile?.email">
            <Mail :size="14" aria-hidden="true" />
            <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          </li>
          <li v-if="profile?.location">
            <MapPin :size="14" aria-hidden="true" />
            <span>{{ profile.location }}</span>
          </li>
        </ul>
      </div>

      <p class="mail__sidebar-title">其他管道</p>
      <ul class="mail__links">
        <li v-for="link in profileStore.socialLinks" :key="link.name">
          <a :href="link.url" target="_blank" rel="noopener noreferrer">
            <Github v-if="link.icon === 'github'" :size="14" aria-hidden="true" />
            <Globe v-else :size="14" aria-hidden="true" />
            {{ link.name }}
          </a>
        </li>
      </ul>
    </aside>

    <!-- 撰寫新郵件 -->
    <section class="mail__compose">
      <header class="mail__compose-head">
        <h3 class="mail__compose-title">新郵件</h3>
        <p class="mail__compose-to">
          收件人：
          <span>{{ profile?.email || 'hello@bb-made.com' }}</span>
        </p>
      </header>

      <div class="mail__form">
        <ContactForm />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Github, Globe, Mail, MapPin } from 'lucide-vue-next'
import ContactForm from '@/components/ContactForm.vue'
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()
const profile = computed(() => profileStore.profile)
const displayName = computed(
  () => profileStore.profile?.display_name || profileStore.profile?.name || 'Bob Tsou'
)
</script>

<style scoped>
.mail {
  display: flex;
  min-height: 100%;
  font-family: var(--font-body);
}

.mail__sidebar {
  flex-shrink: 0;
  width: 210px;
  padding: 1rem 0.85rem;
  background: rgba(12, 9, 7, 0.55);
  border-right: 1px solid var(--os-chrome-border);
}

.mail__sidebar-title {
  margin: 0 0 0.5rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.mail__card {
  margin-bottom: 1.5rem;
  padding: 0.85rem;
  background: rgba(38, 32, 28, 0.5);
  border: 1px solid var(--os-chrome-border);
  border-radius: 8px;
}

.mail__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  letter-spacing: 0.04em;
  color: var(--text);
}

.mail__role {
  margin: 0 0 0.75rem;
  color: var(--volt);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.mail__meta,
.mail__links {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mail__meta li,
.mail__meta a,
.mail__links a {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  text-decoration: none;
  word-break: break-all;
}

.mail__meta svg,
.mail__links svg {
  color: var(--volt);
  flex-shrink: 0;
}

.mail__meta a:hover,
.mail__links a:hover {
  color: var(--volt);
}

.mail__compose {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.mail__compose-head {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--os-chrome-border);
}

.mail__compose-title {
  margin: 0 0 0.15rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.mail__compose-to {
  margin: 0;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.mail__compose-to span {
  color: var(--text-secondary);
}

.mail__form {
  padding: 1.25rem;
}

/* ContactForm 在視窗內不需要置中限寬 */
.mail__form :deep(.contact-form) {
  max-width: 100%;
}

@media (max-width: 768px) {
  .mail {
    flex-direction: column;
  }

  .mail__sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--os-chrome-border);
  }

  .mail__form {
    padding: 1rem;
  }
}
</style>
