import { get } from "lodash";

export default {
  methods: {
    normalizePurchases(purchases){
      const emptyUser = { id: '', name: '', email: '' };
      return purchases.concat().map(purchase => {
        purchase.producer = get(purchase, 'producer', emptyUser);
        purchase.author = get(purchase, 'author', emptyUser);
        purchase.user = get(purchase, 'user', emptyUser);
        return purchase;
      });
    }
  }
}