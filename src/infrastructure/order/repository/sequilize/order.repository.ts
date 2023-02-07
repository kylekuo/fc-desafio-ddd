import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {

  async create(entity: Order): Promise<void> {

    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );

  }

  async update(entity: Order): Promise<void> {

    await OrderModel.update(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map(async item => {
          const updatedItem = {
            id: item.id,
            name: item.name,
            price: item.price,
            product_id: item.productId,
            quantity: item.quantity
          }
          
          await OrderItemModel.update(updatedItem, {
            where: { id: item.id }
          });

          return updatedItem;
        }),
      },
      {
        where: {
          id: entity.id
        },
      }
    );

  }

  async find(id: string): Promise<Order> {

    let orderModel;

    try {
      orderModel = await OrderModel.findOne({
        where: { id },
        include: ['items'],
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    const order = new Order(
      orderModel.id, 
      orderModel.customer_id, 
      orderModel.items.map(item => new OrderItem(
        item.id,
        item.name,
        item.price,
        item.product_id,
        item.quantity
      ))
    );

    return order;

  }

  async findAll(): Promise<Order[]> {

    let orderModel = await OrderModel.findAll({ include: [{ model: OrderItemModel }] });

    let orders = orderModel.map(order => {
      return new Order(
        order.id,
        order.customer_id,
        order.items.map(item => {
          return new OrderItem(
            item.id,
            item.name,
            item.price,
            item.product_id,
            item.quantity
          )
        })
      )
    });

    return orders;

  }

}
