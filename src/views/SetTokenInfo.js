export function SetTokenInfo({deploy}){
    return(
        <div>
            <h3>You're about to mint a token</h3>
            <button onClick={() => deploy()}>Proceed</button>
        </div>
    )
}