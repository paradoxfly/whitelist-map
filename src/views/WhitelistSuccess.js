export function WhitelistSuccess({ outcome }){
  return(
    <h2>
      {
        outcome === true ? 
        'Your address made it into the whitelist' 
        :
        'Your address got rejected!'
      }
    </h2>
  )
}