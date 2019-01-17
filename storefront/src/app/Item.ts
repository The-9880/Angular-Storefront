export class Item
{
    _id: String;
    imageUrl: String;
    name: String;
    description: String;
    price: Number;
    stock: Number;
    amountSold: number; // used to rank popularity of items.
}