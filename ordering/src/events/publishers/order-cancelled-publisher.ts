import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from "@microservices-with-react-and-node-sharmarajdaksh/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
