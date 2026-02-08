import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type ProductStatus = {
    #draft;
    #pending;
    #approved;
    #rejected;
  };

  public type Product = {
    id : Nat;
    title : Text;
    description : Text;
    image : Text;
    category : Text;
    price : Nat;
    stock : Nat;
    status : ProductStatus;
  };

  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type Cart = {
    items : [CartItem];
  };

  public type OrderItem = {
    productId : Nat;
    price : Nat;
    quantity : Nat;
  };

  public type OrderData = {
    buyer : Principal;
    orderId : Nat;
    items : [OrderItem];
    total : Nat;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  public type Category = {
    id : Nat;
    name : Text;
  };

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, Cart>();
  let orders = Map.empty<Principal, Map.Map<Nat, OrderData>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let categories = Map.empty<Nat, Category>();

  var nextProductId = 1;
  var nextOrderId = 1;
  var nextCategoryId = 1;

  // The two authorized emails for bootstrapping new admins:
  let firstAdminEmail = "mohamed.afrith.s.ciet@gmail.com";
  let secondaryAdminEmail = "afriyaafathima@gmail.com";

  // Seed demo data
  func seedDemoData() {
    categories.add(1, { id = 1; name = "Electronics" });
    categories.add(2, { id = 2; name = "Clothing" });
    categories.add(3, { id = 3; name = "Books" });
    nextCategoryId := 4;

    products.add(
      1,
      {
        id = 1;
        title = "Laptop Pro";
        description = "High-performance laptop for professionals";
        image = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400";
        category = "Electronics";
        price = 129_900;
        stock = 10;
        status = #approved;
      },
    );

    products.add(
      2,
      {
        id = 2;
        title = "Wireless Headphones";
        description = "Premium noise-cancelling headphones";
        image = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
        category = "Electronics";
        price = 29_900;
        stock = 25;
        status = #approved;
      },
    );

    products.add(
      3,
      {
        id = 3;
        title = "Cotton T-Shirt";
        description = "Comfortable cotton t-shirt";
        image = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400";
        category = "Clothing";
        price = 1_999;
        stock = 50;
        status = #approved;
      },
    );

    products.add(
      4,
      {
        id = 4;
        title = "Programming Guide";
        description = "Complete guide to modern programming";
        image = "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400";
        category = "Books";
        price = 3_999;
        stock = 30;
        status = #approved;
      },
    );

    nextProductId := 5;
  };

  seedDemoData();

  // Product Management - ADMIN ONLY
  public shared ({ caller }) func createProduct(product : Product) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    let productId = nextProductId;
    nextProductId += 1;
    let newProduct = { product with id = productId };
    products.add(productId, newProduct);
    productId;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, updatedProduct : Product) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.add(productId, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func approveProduct(productId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve products");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let approvedProduct = { product with status = #approved };
        products.add(productId, approvedProduct);
      };
    };
  };

  public shared ({ caller }) func rejectProduct(productId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject products");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let rejectedProduct = { product with status = #rejected };
        products.add(productId, rejectedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.remove(productId);
      };
    };
  };

  // Query products (approved only for non-admins, all for admins)
  public query ({ caller }) func getProducts() : async [Product] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    products.values().filter(
      func(product : Product) : Bool {
        isAdmin or product.status == #approved
      }
    ).toArray();
  };

  public query ({ caller }) func getProduct(productId : Nat) : async ?Product {
    switch (products.get(productId)) {
      case (null) { null };
      case (?product) {
        if (AccessControl.isAdmin(accessControlState, caller) or product.status == #approved) {
          ?product;
        } else {
          null;
        };
      };
    };
  };

  // Category Management - ADMIN ONLY
  public shared ({ caller }) func createCategory(name : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    let categoryId = nextCategoryId;
    nextCategoryId += 1;
    let category = { id = categoryId; name = name };
    categories.add(categoryId, category);
    categoryId;
  };

  public shared ({ caller }) func updateCategory(categoryId : Nat, name : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        categories.add(categoryId, { id = categoryId; name = name });
      };
    };
  };

  public shared ({ caller }) func deleteCategory(categoryId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {
        categories.remove(categoryId);
      };
    };
  };

  // Query categories - PUBLIC (no auth required)
  public query func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public query func getCategory(categoryId : Nat) : async ?Category {
    categories.get(categoryId);
  };

  // Cart Management - USER ONLY
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add to cart");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (product.status != #approved) {
          Runtime.trap("Product not available");
        };
        if (product.stock < quantity) {
          Runtime.trap("Insufficient stock");
        };

        let cart = switch (carts.get(caller)) {
          case (null) { { items = [{ productId; quantity }] } };
          case (?existingCart) {
            let existingItems = existingCart.items;
            var found = false;
            let newItems = existingItems.vals().map(
              func(item : CartItem) : CartItem {
                if (item.productId == productId) {
                  found := true;
                  { item with quantity = item.quantity + quantity };
                } else {
                  item;
                };
              }
            ).toArray();

            if (not found) {
              { items = newItems.concat([{ productId; quantity }]) };
            } else {
              { items = newItems };
            };
          };
        };
        carts.add(caller, cart);
      };
    };
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, quantity : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update cart");
    };

    switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) {
        if (quantity == 0) {
          let newItems = cart.items.vals().filter(
            func(item : CartItem) : Bool { item.productId != productId }
          ).toArray();
          carts.add(caller, { items = newItems });
        } else {
          let newItems = cart.items.vals().map(
            func(item : CartItem) : CartItem {
              if (item.productId == productId) { { item with quantity = quantity } } else {
                item;
              };
            }
          ).toArray();
          carts.add(caller, { items = newItems });
        };
      };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can remove from cart");
    };

    switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) {
        let newItems = cart.items.vals().filter(
          func(item : CartItem) : Bool { item.productId != productId }
        ).toArray();
        carts.add(caller, { items = newItems });
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can clear cart");
    };
    carts.remove(caller);
  };

  public query ({ caller }) func getCart() : async ?Cart {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view cart");
    };
    carts.get(caller);
  };

  // Checkout - USER ONLY
  public shared ({ caller }) func checkout() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can checkout");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?c) {
        if (c.items.size() == 0) {
          Runtime.trap("Cart is empty");
        };
        c;
      };
    };

    let orderId = nextOrderId;
    nextOrderId += 1;

    let items : [OrderItem] = cart.items.vals().map(
      func(cartItem : CartItem) : OrderItem {
        let product = switch (products.get(cartItem.productId)) {
          case (null) { Runtime.trap("Product not found") };
          case (?p) {
            if (p.stock < cartItem.quantity) {
              Runtime.trap("Insufficient stock for product: " # p.title);
            };
            p;
          };
        };
        { productId = cartItem.productId; price = product.price; quantity = cartItem.quantity };
      }
    ).toArray();

    var total : Nat = 0;
    for (item in items.vals()) {
      total += item.price * item.quantity;
    };

    let order : OrderData = {
      buyer = caller;
      orderId;
      items;
      total;
    };

    let userOrders = switch (orders.get(caller)) {
      case (null) {
        let newOrders = Map.empty<Nat, OrderData>();
        newOrders.add(orderId, order);
        newOrders;
      };
      case (?existingOrders) {
        existingOrders.add(orderId, order);
        existingOrders;
      };
    };

    orders.add(caller, userOrders);

    // Update product stock
    for (item in items.vals()) {
      switch (products.get(item.productId)) {
        case (?product) {
          let updatedProduct = { product with stock = product.stock - item.quantity };
          products.add(item.productId, updatedProduct);
        };
        case (null) { /* Should not happen */ };
      };
    };

    carts.remove(caller);

    orderId;
  };

  // Order Management
  public query ({ caller }) func getOrders() : async [OrderData] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    switch (orders.get(caller)) {
      case (null) { [] };
      case (?userOrders) {
        userOrders.values().toArray();
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?OrderData {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    switch (orders.get(caller)) {
      case (null) { null };
      case (?userOrders) {
        userOrders.get(orderId);
      };
    };
  };

  // Admin: View all orders
  public query ({ caller }) func getAllOrders() : async [OrderData] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    var allOrders : [OrderData] = [];
    for (userOrderMap in orders.values()) {
      let userOrdersArray = userOrderMap.values().toArray();
      allOrders := allOrders.concat(userOrdersArray);
    };
    allOrders;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin can view all");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin: Get all user profiles
  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all profiles");
    };
    userProfiles.entries().toArray();
  };

  // ADMIN BOOTSTRAPPING: Check current roles and provide admin assignment
  public shared ({ caller }) func checkCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  /// Add admin privileges by principal.
  /// Admin role required, or reserved for bootstrapping first admin.
  public shared ({ caller }) func addAdminByPrincipal(newAdmin : Principal) : async () {
    assignAdminRoleIfAuthorized(caller, newAdmin);
  };

  /// Add admin privileges by email.
  /// Admin role required, or reserved for bootstrapping first admin.
  public shared ({ caller }) func addAdminByEmail(newAdminEmail : Text) : async () {
    // Find matching user (if any)
    let matchingUserEntry = userProfiles.entries().find(
      func((_, userProfile)) { userProfile.email == newAdminEmail }
    );

    switch (matchingUserEntry) {
      case (null) {
        Runtime.trap("Cannot assign admin role: No user profile found for email '" # newAdminEmail # "'. The target user must sign in and complete profile setup with this email address before they can be granted admin privileges. If you are the intended second owner with email " # secondaryAdminEmail # ", make sure to complete your profile with this email so your account can receive admin privileges via this function.");
      };
      case (?p) {
        assignAdminRoleIfAuthorized(
          caller,
          p.0, // Principal of profile creator
        );
      };
    };
  };

  /// Helper function to check if any admin exists in the system
  func hasAnyAdmin() : Bool {
    // Check if any user profile has admin role
    for ((principal, _) in userProfiles.entries()) {
      if (AccessControl.isAdmin(accessControlState, principal)) {
        return true;
      };
    };
    false;
  };

  /// Helper function to check if caller is authorized bootstrap admin
  func isBootstrapAdmin(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        profile.email == firstAdminEmail or profile.email == secondaryAdminEmail;
      };
      case (null) { false };
    };
  };

  /// Helper function to assign admin role if authorized.
  /// Throws if not authorized.
  func assignAdminRoleIfAuthorized(caller : Principal, newAdmin : Principal) {
    let callerIsAdmin = AccessControl.isAdmin(accessControlState, caller);
    let callerIsBootstrap = isBootstrapAdmin(caller);
    let systemHasAdmin = hasAnyAdmin();

    // Authorization logic:
    // 1. If system has no admins yet AND caller is bootstrap admin -> allow (bootstrap)
    // 2. If caller is already an admin -> allow (normal admin operation)
    // 3. Otherwise -> deny

    if (not systemHasAdmin and callerIsBootstrap) {
      // Bootstrap case: first admin setup
      AccessControl.assignRole(accessControlState, caller, newAdmin, #admin);
    } else if (callerIsAdmin) {
      // Normal case: existing admin granting admin to another user
      AccessControl.assignRole(accessControlState, caller, newAdmin, #admin);
    } else {
      Runtime.trap(
        "Unauthorized: Only existing admins can grant admin privileges. For initial setup, the bootstrap admin (" # firstAdminEmail # " or " # secondaryAdminEmail # ") must sign in first when no admins exist.",
      );
    };
  };

  public query ({ caller }) func isAdmin(callerToCheck : ?Principal) : async Bool {
    switch (callerToCheck) {
      case (null) { AccessControl.isAdmin(accessControlState, caller) };
      case (?other) { AccessControl.isAdmin(accessControlState, other) };
    };
  };
};
