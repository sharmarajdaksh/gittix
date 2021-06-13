import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@microservices-with-react-and-node-sharmarajdaksh/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
