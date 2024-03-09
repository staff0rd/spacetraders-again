import { DefaultApiFactory } from "./api";

while (true) {
    const result = await DefaultApiFactory().getStatus();
    console.log(result.data);
    await new Promise(r => setTimeout(r, 300_000));
}