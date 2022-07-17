export function DisplayWhitelist({contractInfo, whitelist}){
    return(
        <div>
            <h2 className="animate">Waiting for attachers</h2>
            <textarea value={contractInfo} disabled/>
            {
                whitelist.map((value, key) => (
                    <h3>Address {key}: {value}</h3>
                ))
            }
        </div>
    )
}