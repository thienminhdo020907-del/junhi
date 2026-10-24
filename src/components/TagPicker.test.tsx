import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TagPicker from './TagPicker'

// Thay hook IndexedDB bằng state trong bộ nhớ
const store = { tags: [] as string[] }
vi.mock('@/db/useCustomTags', async () => {
  const React = await import('react')
  return {
    useCustomTags: () => {
      const [tags, setTags] = React.useState<string[]>(store.tags)
      return {
        loading: false,
        tags,
        add: async (t: string) => {
          store.tags = [...store.tags, t]
          setTags(store.tags)
        },
        remove: async (t: string) => {
          store.tags = store.tags.filter((x) => x !== t)
          setTags(store.tags)
        },
      }
    },
  }
})

function Harness({ initial = [] as string[] }) {
  const [selected, setSelected] = useState<string[]>(initial)
  return (
    <>
      <TagPicker
        selected={selected}
        onToggle={(t) =>
          setSelected((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t]))
        }
        onSelect={(t) => setSelected((c) => (c.includes(t) ? c : [...c, t]))}
      />
      <span data-testid="selected">{selected.join('|')}</span>
    </>
  )
}

const openEditor = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Thêm cảm xúc mới' }))
  return await screen.findByRole('textbox', { name: 'Cảm xúc của bạn' })
}

describe('TagPicker – tag tùy chỉnh', () => {
  beforeEach(() => {
    store.tags = []
    vi.restoreAllMocks()
  })

  it('thêm: Enter lưu tag mới và tự chọn cho hôm nay', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = await openEditor(user)
    expect(input).toHaveFocus()
    await user.type(input, '  nhớ nhà {Enter}')

    const chip = await screen.findByRole('button', { name: 'nhớ nhà' })
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('selected')).toHaveTextContent('nhớ nhà')
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument())
  })

  it('thêm: nút ✓ lưu, nút ✕ và Esc hủy', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    let input = await openEditor(user)
    await user.type(input, 'hy vọng')
    await user.click(screen.getByRole('button', { name: 'Lưu cảm xúc' }))
    expect(await screen.findByRole('button', { name: 'hy vọng' })).toBeInTheDocument()

    input = await openEditor(user)
    await user.type(input, 'sẽ hủy')
    await user.click(screen.getByRole('button', { name: 'Hủy' }))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'sẽ hủy' })).not.toBeInTheDocument(),
    )

    input = await openEditor(user)
    await user.type(input, 'cũng hủy{Escape}')
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'cũng hủy' })).not.toBeInTheDocument()
  })

  it('thêm: bấm ra ngoài thì hủy', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button type="button">ngoài</button>
        <Harness />
      </>,
    )
    await openEditor(user)
    await user.click(screen.getByRole('button', { name: 'ngoài' }))
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument())
  })

  it('rỗng: không tạo chip và báo nhắc nhẹ', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = await openEditor(user)
    await user.type(input, '    {Enter}')
    expect(screen.getByRole('status')).toHaveTextContent('hãy nhập một cảm xúc nhé')
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(store.tags).toEqual([])
  })

  it('quá dài: báo lỗi và không lưu', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = await openEditor(user)
    fireEvent.change(input, { target: { value: 'x'.repeat(21) } })
    await user.keyboard('{Enter}')
    expect(screen.getByRole('status')).toHaveTextContent('tối đa 20 ký tự')
    expect(store.tags).toEqual([])
  })

  it('bộ đếm hiện khi gần chạm giới hạn', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = await openEditor(user)
    await user.type(input, 'a'.repeat(16))
    expect(screen.getByText('16/20')).toBeInTheDocument()
  })

  it('trùng: chọn chip cũ (không phân biệt dấu/hoa thường), không tạo mới', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = await openEditor(user)
    await user.type(input, 'VUI VE{Enter}')

    expect(screen.getByRole('button', { name: 'Vui vẻ' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('selected')).toHaveTextContent('Vui vẻ')
    expect(store.tags).toEqual([])
  })

  it('xóa: có xác nhận, chỉ tag tùy chỉnh mới xóa được', async () => {
    store.tags = ['nhớ nhà']
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<Harness initial={['nhớ nhà']} />)

    // 12 tag mặc định không có nút xóa
    expect(screen.queryByRole('button', { name: 'Xóa cảm xúc Vui vẻ' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Xóa cảm xúc nhớ nhà' }))
    expect(confirmSpy).toHaveBeenCalledWith('xóa khỏi danh sách? các ngày cũ vẫn giữ tag này')
    expect(screen.getByRole('button', { name: 'nhớ nhà' })).toBeInTheDocument()

    confirmSpy.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Xóa cảm xúc nhớ nhà' }))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'nhớ nhà' })).not.toBeInTheDocument(),
    )
    expect(store.tags).toEqual([])
  })

  it('giới hạn 30 tag: hiện thông báo nhỏ', async () => {
    store.tags = Array.from({ length: 30 }, (_, i) => `riêng ${i}`)
    const user = userEvent.setup()
    render(<Harness />)
    const input = await openEditor(user)
    await user.type(input, 'thứ ba mươi mốt{Enter}')
    expect(screen.getByRole('status')).toHaveTextContent('bạn đã có nhiều cảm xúc riêng rồi')
    expect(store.tags).toHaveLength(30)
  })
})
