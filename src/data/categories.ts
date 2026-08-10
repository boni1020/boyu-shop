export const categories = [
    {
        name: '生活補給',
        slug: 'health',
    },
    {
        name: '精選美研',
        slug: 'beauty',
    },
    {
        name: '舒適配飾',
        slug: 'fashion',
    },
    {
        name: '日之選用',
        slug: 'lifestyle',
    },
    {
        name: '食光選物',
        slug: 'snacks',
    },
] as const

export type Category = (typeof categories)[number]['name']