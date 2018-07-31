export default function ({ $axios, redirect }) {
  $axios.onRequest(config => {
    console.log('Making request to ' + config.url)
  })

  $axios.onError(err => {
    const code = parseInt(err.response && err.response.status)
    if (code === 400) {
      redirect('/400')
    } else {
      console.log(err)
    }
  })
}
