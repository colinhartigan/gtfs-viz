export async function parseGTFS(path) {
    const response = await fetch(path);
    const data = (await response.text()).split("\n");

    let fields = data[0].split(",");
    let output = {};
    const regex = /(?:^|,)(?=[^"]|(")?)"?((?(1)(?:[^"]|"")*|[^,"]*))"?(?=,|$)/;

    for (let line of data.slice(1)) {
        let [id, ...rest] = line.split(/(\?:^|,)(\?=[^"]|(")\?)"\?((\?(1)(\?:[^"]|"")*|[^,"]*))"\?(\?=,|$));
        let stop = {};
        for (let i = 1; i < fields.length; i++) {
            stop[fields[i]] = rest[i - 1];
        }
        output[id] = stop;
    }

    return output;
}
