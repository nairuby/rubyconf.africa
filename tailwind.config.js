/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Modern site templates and includes only
    '_layouts/modern/**/*.{html,liquid}',
    '_includes/modern/**/*.{html,liquid}',
    'assets/modern/js/**/*.js',
    // Current site pages (2026+)
    'index.html',
    'speakers.html',
    'about-us.html',
    'practicalities.html',
    'code-of-conduct.html',
    'contact.html',
    'schedule.html',
    'blog.html'
  ],
  theme: {
    extend: {
      colors: {
        // RubyConf Africa brand colors
        'ruby-red': '#CC342D',
        'ruby-dark': '#A02622',
        'ruby-light': '#E85A54',
        'conference-blue': '#2563EB',
        'conference-gray': '#6B7280'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'system-ui', 'sans-serif']
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      }
    },
  },
  plugins: [],
  // Ensure no conflicts with archive Bootstrap classes
  corePlugins: {
    preflight: false // Disable CSS reset to avoid conflicts with archives
  }
}