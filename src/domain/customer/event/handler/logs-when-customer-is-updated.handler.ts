import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerUpdatedEvent from "../customer-created.event";

export default class LogsWhenCustomerIsUpdatedHandler implements EventHandlerInterface<CustomerUpdatedEvent> {
  handle(event: CustomerUpdatedEvent): void {
		const data = event.eventData;
    console.log(`Endereço do cliente: ${data.id}, ${data.name} alterado para: ${data.Address.toString()}`); 
  }
}
