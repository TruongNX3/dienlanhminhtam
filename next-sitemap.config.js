/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://dienlanhminhtam.com',
  generateRobotsTxt: true,
  // exclude: ['/admin', '/admin/*'], // Exclude admin pages from sitemap
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/admin', '/admin/*'],
      },
    ],
  },
}
