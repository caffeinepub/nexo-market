import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export interface Product {
    id: bigint;
    status: ProductStatus;
    title: string;
    description: string;
    stock: bigint;
    category: string;
    image: string;
    price: bigint;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    price: bigint;
}
export interface Cart {
    items: Array<CartItem>;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Category {
    id: bigint;
    name: string;
}
export interface OrderData {
    total: bigint;
    orderId: bigint;
    buyer: Principal;
    items: Array<OrderItem>;
}
export enum ProductStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected",
    draft = "draft"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Add admin privileges by email.
     * / Admin role required, or reserved for bootstrapping first admin.
     */
    addAdminByEmail(newAdminEmail: string): Promise<void>;
    /**
     * / Add admin privileges by principal.
     * / Admin role required, or reserved for bootstrapping first admin.
     */
    addAdminByPrincipal(newAdmin: Principal): Promise<void>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    approveProduct(productId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkCallerUserRole(): Promise<UserRole>;
    checkout(): Promise<bigint>;
    clearCart(): Promise<void>;
    createCategory(name: string): Promise<bigint>;
    createProduct(product: Product): Promise<bigint>;
    deleteCategory(categoryId: bigint): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllOrders(): Promise<Array<OrderData>>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart | null>;
    getCategories(): Promise<Array<Category>>;
    getCategory(categoryId: bigint): Promise<Category | null>;
    getOrder(orderId: bigint): Promise<OrderData | null>;
    getOrders(): Promise<Array<OrderData>>;
    getProduct(productId: bigint): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdmin(callerToCheck: Principal | null): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    rejectProduct(productId: bigint): Promise<void>;
    removeFromCart(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCartItem(productId: bigint, quantity: bigint): Promise<void>;
    updateCategory(categoryId: bigint, name: string): Promise<void>;
    updateProduct(productId: bigint, updatedProduct: Product): Promise<void>;
}
