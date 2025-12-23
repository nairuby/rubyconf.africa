export default {
  content: [
    // Only modern site files - strict isolation from archives
    '_layouts/modern/**/*.{html,liquid}',
    '_includes/modern/**/*.{html,liquid}',
    'assets/modern/js/**/*.js',
    // Current site pages only (2026+)
    'index.html',
    'speakers.html', 
    'about-us.html',
    'practicalities.html',
    'code-of-conduct.html',
    'contact.html',
    'schedule.html',
    'blog.html',
    // Generated site files for current year only
    '_site/index.html',
    '_site/speakers.html',
    '_site/about-us.html',
    '_site/practicalities.html',
    '_site/code-of-conduct.html',
    '_site/contact.html',
    '_site/schedule.html',
    '_site/blog.html'
  ],
  css: ['assets/modern/css/main.css'],
  output: 'assets/modern/css/main.purged.css',
  safelist: [
    // Preserve dynamic classes that might be added via JS
    /^hover:/,
    /^focus:/,
    /^active:/,
    /^group-hover:/,
    /^sm:/,
    /^md:/,
    /^lg:/,
    /^xl:/,
    /^2xl:/
  ]
}