export function SubmitAddress({accept, redirect}){
  return(
    <>
      <h2>Do you wish to submit your wallet address?</h2>
      <button onClick={() => accept()}>Yes</button>
      <button onClick={() => redirect()}>No</button>
    </>
  )
}