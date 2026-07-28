import { Menu, ConfigProvider, type MenuProps } from 'antd'
import { type MenuGroup } from './menus'
import { MenuIcon, type IconName } from '../components/icons'

type AntdItem = NonNullable<MenuProps['items']>[number]

/** 把扁平的 MenuGroup[]（section → group → items）转成 antd 树形 items */
function buildItems(menu: MenuGroup[], sub: string, menuIcon: (k: string) => IconName): MenuProps['items'] {
  // 按 section 归并；无 section 的 group 直接作为顶层
  const sections: { name: string | null; groups: MenuGroup[] }[] = []
  let curSec: { name: string | null; groups: MenuGroup[] } | null = null
  for (const g of menu) {
    const sec = g.section ?? null
    if (!curSec || curSec.name !== sec) {
      curSec = { name: sec, groups: [] }
      sections.push(curSec)
    }
    curSec.groups.push(g)
  }

  const leaf = (it: { key: string; label: string }): AntdItem => ({
    key: it.key.split(':')[1],
    icon: <MenuIcon name={menuIcon(it.key)} className="h-4 w-4" />,
    label: it.label,
  })

  const groupToNode = (g: MenuGroup): AntdItem => {
    if (g.items.length === 1) {
      const it = g.items[0]
      // 单条 group：直接作为叶子，用 group 名做展示，避免「标题与项重复」
      return {
        key: it.key.split(':')[1],
        icon: <MenuIcon name={menuIcon(it.key)} className="h-4 w-4" />,
        label: g.group,
      }
    }
    return {
      key: `grp:${sub}:${g.group}`,
      label: g.group,
      className: 'side-group',
      children: g.items.map(leaf),
    }
  }

  const items: MenuProps['items'] = []
  for (const s of sections) {
    const children = s.groups.map(groupToNode)
    if (s.name) {
      items.push({ key: `sec:${sub}:${s.name}`, label: s.name, className: 'side-sec', children })
    } else {
      items.push(...children)
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
