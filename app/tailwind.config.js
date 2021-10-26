const colors = require('tailwindcss/colors')

module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false,
    theme: {
        colors: {
            amber: colors.amber,
            black: colors.black,
            white: colors.white,
            gray: colors.trueGray,
            indigo: colors.indigo,
            red: colors.rose,
            blue: colors.blue,
            coolgray: colors.coolGray,
            'brand-yellow': '#FCD620',            
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}