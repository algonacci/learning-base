import cors from 'cors'
import express from 'express'

const app = express()
app.use(express.json())
app.use(cors())

app.post('/', async (req, res) => {
  const { content } = req.body
  console.log(content)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer sk-',
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: content
        }
      ],
      stream: true
    })
  })

  if (!response.body) return
  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  let isFinished = false
  while (!isFinished) {
    const { value, done } = await reader.read()
    isFinished = done

    const decodedValue = decoder.decode(value)
    if (!decodedValue) break

    const messages = decodedValue.split('\n\n')
    const chunks = messages
      .filter(msg => msg && msg !== 'data: [DONE]')
      .map(message => JSON.parse(message.replace(/^data:/g, '').trim()))

    for (const chunk of chunks) {
      const content = chunk.choices[0].delta.content
      if (content) {
        res.write(content)
      }
    }
  }

  res.end()

})

app.listen(4000, () => {
  console.log('Server listening on port 4000')
})
