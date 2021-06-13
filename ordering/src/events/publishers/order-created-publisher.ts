import {
  OrderCreatedEvent,
  Publisher,
  Subjects,
} from "@microservices-with-react-and-node-sharmarajdaksh/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
