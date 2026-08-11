import { Menu, ConfigProvider, type MenuProps } from 'antd'
import { type MenuGroup } from './menus'
import { MenuIcon, type IconName } from '../components/icons'

type AntdItem = NonNullable<MenuProps['items']>[number]

/** 把扁平的 MenuGroup[]（section → group → items）转成 antd 二级菜单：
 *  - section 仅作为视觉分区标题（type:'group'，不可点击、不占层级）
 *  - 页面 item 直接平铺为叶子，不再因 group 嵌套出额外层级
 */
function buildItems(menu: MenuGroup[], sub: string, menuIcon: (k: string) => IconName): MenuProps['items'] {
  // 按 section 归并分组；多 item 的 group 直接把 items 平铺到所属分区下
  const sections: { name: string | null; items: { key: string; label: string }[] }[] = []
  let curSec: { name: string | null; items: { key: string; label: string }[] } | null = null
  for (const g of menu) {
    const sec = g.section ?? null
    if (!curSec || curSec.name !== sec) {
      curSec = { name: sec, items: [] }
      sections.push(curSec)
    }
    // 单 item 的 group：用「页面真实名」做展示（与多 item 平铺一致）；多 item 直接平铺各自 label
    if (g.items.length === 1) {
      curSec.items.push({ key: g.items[0].key, label: g.items[0].label })
    } else {
      for (const it of g.items) curSec.items.push(it)
    }
  }

  const leaf = (it: { key: string; label: string }): AntdItem => ({
    key: it.key.split(':')[1],
    icon: <MenuIcon name={menuIcon(it.key)} className="h-4 w-4" />,
    label: it.label,
  })

  const items: MenuProps['items'] = []
  for (const s of sections) {
    if (!s.items.length) continue
    if (s.name) {
      items.push({ type: 'group', label: s.name, children: s.items.map(leaf) })
    } else {
      items.push(...s.items.map(leaf))
    }
  }
  return items
}

/** 找到通往目标 key 的祖先链（不含目标本身），用于默认展开 */
function findOpenKeys(items: MenuProps['items'], target: string): string[] | null {
  for (const it of items ?? []) {
    if (!it || it.key == null) continue
    const k = String(it.key)
    if (k === target) return []
    const children = (it as { children?: MenuProps['items'] }).children
    if (children) {
      const sub = findOpenKeys(children, target)
      if (sub) return [k, ...sub]
    }
  }
  return null
}

/** 收集所有含子节点的 key（section / group），用于「全部默认展开」 */
function collectOpenKeys(items: MenuProps['items']): string[] {
  const keys: string[] = []
  for (const it of items ?? []) {
    if (!it || it.key == null) continue
    const k = String(it.key)
    const children = (it as { children?: MenuProps['items'] }).children
    if (children && children.length) {
      keys.push(k, ...collectOpenKeys(children))
    }
  }
  return keys
}

interface Props {
  menu: MenuGroup[]
  sub: string
  cur: string
  menuIcon: (k: string) => IconName
  nav: (to: string) => void
}

export default function SidebarMenu({ menu, sub, cur, menuIcon, nav }: Props) {
  const items = buildItems(menu, sub, menuIcon)
  const openKeys = findOpenKeys(items, cur) ?? []

  return (
    <div className="console-side-menu-wrap">
      <ConfigProvider
        theme={{
          token: { colorPrimary: '#1f47f5', borderRadius: 8, fontSize: 14 },
          components: {
            Menu: {
              itemBg: 'transparent',
              itemColor: '#475569',
              itemHoverBg: '#f1f5f9',
              itemHoverColor: '#1735e1',
              itemActiveBg: '#eef4ff',
              itemSelectedBg: '#eef4ff',
              itemSelectedColor: '#1735e1',
              itemSelectedFontWeight: 600,
              itemHeight: 40,
              itemMarginInline: 2,
              itemBorderRadius: 8,
              itemPaddingInline: 4,
              itemIconSize: 16,
              itemIconMarginInline: '8px',
              subMenuItemBg: 'transparent',
              subMenuItemColor: '#334155',
              subMenuItemHoverBg: '#f1f5f9',
              subMenuItemHoverColor: '#1735e1',
              subMenuItemBorderRadius: 8,
              groupTitleColor: '#94a3b8',
              groupTitleFontSize: 12,
            },
          },
        }}
      >
        <Menu
          className="console-side-menu"
          mode="inline"
          items={items}
          selectedKeys={[cur]}
          defaultOpenKeys={collectOpenKeys(items)}
          inlineIndent={10}
          style={{ borderInlineEnd: 'none', width: '100%', background: 'transparent' }}
          onClick={({ key }) => {
            if (key.startsWith('sec:') || key.startsWith('grp:')) return
            nav(`/console/${sub}/${key}`)
          }}
        />
      </ConfigProvider>
    </div>
  )
}
