import EventDispatcher from "../../../@shared/event/event-dispatcher";
import Customer from "../../entity/customer";
import Address from "../../value-object/address";
import CustomerCreatedEvent from "../customer-created.event";
import CustomerUpdatedEvent from "../customer-updated.event";
import LogsWhenProductIsCreatedHandler from "./logs-when-customer-is-created.handler";
import AlsoLogsWhenProductIsCreatedHandler from "./also-logs-when-customer-is-created.handler";
import LogsWhenCustomerIsUpdatedHandler from "./logs-when-customer-is-updated.handler";

describe('Customer created event tests', () => {
	
	it('should log twice when customer created', () => {
		
		const eventDispatcher = new EventDispatcher(),
					firstHandler = new LogsWhenProductIsCreatedHandler(),
					secondHandler = new AlsoLogsWhenProductIsCreatedHandler();
	
		eventDispatcher.register("CustomerCreatedEvent", firstHandler);
		eventDispatcher.register("CustomerCreatedEvent", secondHandler);
	
		expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"]).toBeDefined();
		expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"]).toEqual([firstHandler, secondHandler]);

		const firstSpy = jest.spyOn(firstHandler, "handle"),
					secondSpy = jest.spyOn(secondHandler, "handle");

		const customer = new Customer('Cs1', 'Customer One'),
					customerCreatedEvent = new CustomerCreatedEvent(customer);

    eventDispatcher.notify(customerCreatedEvent);

    expect(firstSpy).toHaveBeenCalled();
    expect(secondSpy).toHaveBeenCalled();

	});
	
	it('should log when customer address changed', () => {
		
		const eventDispatcher = new EventDispatcher(),
					updateHandler = new LogsWhenCustomerIsUpdatedHandler();
	
		eventDispatcher.register("CustomerUpdatedEvent", updateHandler);
	
		expect(eventDispatcher.getEventHandlers["CustomerUpdatedEvent"]).toBeDefined();
		expect(eventDispatcher.getEventHandlers["CustomerUpdatedEvent"]).toEqual([updateHandler]);

		const updateSpy = jest.spyOn(updateHandler, "handle");

		const customer = new Customer('Cs1', 'Customer One'),
					address =  new Address('St1', 1, 'Zi1', 'Ci1');

		customer.changeAddress(address);

		const customerUpdatedEvent = new CustomerUpdatedEvent(customer);
    eventDispatcher.notify(customerUpdatedEvent);

    expect(updateSpy).toHaveBeenCalled();

	});


});