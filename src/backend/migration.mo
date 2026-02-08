import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

module {
  type OldProduct = {
    id : Nat;
    title : Text;
    description : Text;
    image : Text;
    category : Text;
    price : Nat;
    stock : Nat;
    status : { #draft; #pending; #approved; #rejected };
  };

  type OldProductStatus = {
    #draft;
    #pending;
    #approved;
    #rejected;
  };

  type OldCartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type OldCart = {
    items : [OldCartItem];
  };

  type OldOrderItem = {
    productId : Nat;
    price : Nat;
    quantity : Nat;
  };

  type OldOrder = {
    buyer : Principal;
    orderId : Nat;
    items : [OldOrderItem];
    total : Nat;
  };

  type OldUserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  type OldCategory = {
    id : Nat;
    name : Text;
  };

  type OldActor = {
    products : Map.Map<Nat, OldProduct>;
    carts : Map.Map<Principal, OldCart>;
    orders : Map.Map<Principal, Map.Map<Nat, OldOrder>>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    categories : Map.Map<Nat, OldCategory>;
    nextProductId : Nat;
    nextOrderId : Nat;
    nextCategoryId : Nat;
  };

  type NewActor = {
    products : Map.Map<Nat, OldProduct>;
    carts : Map.Map<Principal, OldCart>;
    orders : Map.Map<Principal, Map.Map<Nat, OldOrder>>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    categories : Map.Map<Nat, OldCategory>;
    nextProductId : Nat;
    nextOrderId : Nat;
    nextCategoryId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      products = old.products;
      carts = old.carts;
      orders = old.orders;
      userProfiles = old.userProfiles;
      categories = old.categories;
      nextProductId = old.nextProductId;
      nextOrderId = old.nextOrderId;
      nextCategoryId = old.nextCategoryId;
    };
  };
};
