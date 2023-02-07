import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {

  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);

    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update an order", async () => {

    const customerRepository = new CustomerRepository();
    const customer = new Customer("Cs1", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);
    
    const productRepository = new ProductRepository();

    const productOne = new Product("Pr1", "Product 1", 10);
    await productRepository.create(productOne);

    const productTwo = new Product("Pr2", "Product 2", 20);
    await productRepository.create(productTwo);

    const orderItemOne = new OrderItem("Oi1", productOne.name, productOne.price, productOne.id, 2);
    const orderItemTwo = new OrderItem("Oi2", productTwo.name, productTwo.price, productTwo.id, 2);

    const orderRepository = new OrderRepository();
    const order = new Order("Or1", "Cs1", [ orderItemOne, orderItemTwo ]);
    await orderRepository.create(order);

    orderItemTwo.updateQuantity(10);
    await orderRepository.update(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"]
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "Or1",
      customer_id: "Cs1",
      total: order.total(),
      items: [
        {
          order_id: "Or1",
          product_id: "Pr1",
          id: orderItemOne.id,
          name: orderItemOne.name,
          price: orderItemOne.price,
          quantity: orderItemOne.quantity,
        },
        {
          order_id: "Or1",
          product_id: "Pr2",
          id: orderItemTwo.id,
          name: orderItemTwo.name,
          price: orderItemTwo.price,
          quantity: orderItemTwo.quantity,
        },
      ]
    });

  });

  it("should find an order", async () => {

    const customerRepository = new CustomerRepository();
    const customer = new Customer("Cs1", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);
    
    const productRepository = new ProductRepository();
    const productOne = new Product("Pr1", "Product 1", 10);
    await productRepository.create(productOne);

    const orderRepository = new OrderRepository();
    const orderItemOne = new OrderItem("Oi1", productOne.name, productOne.price, productOne.id, 2);
    const order = new Order("Or1", "Cs1", [ orderItemOne ]);
    await orderRepository.create(order);

    const foundByRepository = await orderRepository.find(order.id);

    expect(foundByRepository).toStrictEqual(order);

  });

  it("should find all orders", async () => {

    const customerRepository = new CustomerRepository();
    const customer = new Customer("Cs1", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);
    
    const productRepository = new ProductRepository();

    const productOne = new Product("Pr1", "Product 1", 10);
    await productRepository.create(productOne);

    const productTwo = new Product("Pr2", "Product 2", 20);
    await productRepository.create(productTwo);

    const orderRepository = new OrderRepository();
    
    const orderItemOne = new OrderItem("Oi1", productOne.name, productOne.price, productOne.id, 2);
    const orderOne = new Order("Or1", "Cs1", [ orderItemOne ]);
    await orderRepository.create(orderOne);

    const orderItemTwo = new OrderItem("Oi2", productOne.name, productOne.price, productOne.id, 2);
    const orderTwo = new Order("Or2", "Cs1", [ orderItemTwo ]);
    await orderRepository.create(orderTwo);

    const orders = [orderOne, orderTwo];
    const foundByRepository = await orderRepository.findAll();

    expect(foundByRepository).toEqual(orders);

  });
});
