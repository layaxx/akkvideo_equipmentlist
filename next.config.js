module.exports = {
  async redirects() {
    return [
      {
        source: '/f/:id',
        destination: '/foodle/:id',
        permanent: true,
      },
    ]
  },
}
