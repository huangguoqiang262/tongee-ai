import defaultSettings from '@/settings'

const title = defaultSettings.title || '紫薯AI '

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
