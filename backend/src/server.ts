import app from './app'

const start = async () => {
  try {
    const port = process.env.PORT || 3000
    await app.listen({
      port: port as number,
      host: '0.0.0.0',
    })
    console.log(`Server running on http://localhost:${port}. Check docs in http://localhost:${port}/apidocs`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

start()
