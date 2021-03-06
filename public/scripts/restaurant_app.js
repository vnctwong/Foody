// Script for restaurant.ejs
// Creates html structure in restaurant page

function convertDate(time) {
  let date = new Date(time);
  let hours = date.getHours();
  let ampm;
  if (hours > 12) {
    if (hours === 12) ampm = "pm";
    else {
      ampm = "pm";
      hours -= 12;
    }
  } else ampm = "am";
  let minutes = "0" + date.getMinutes();
  return hours + ":" + minutes.substr(-2) + ampm;
}

function addOrderHeader(order) {
  //adds a header for each order
  let contents = `
    <div class="accordion-header">Order ${order.order_id} from ${order.guest_name}, ${order.phone} at ${convertDate(
    order.time_stamp
  )}</div>
    <div class="accordion-content">
      <div id="items${order.order_id}" class="order-items" class="d-flex justify-content-start order-item">
      </div>
      <!--Order total-->
      <div class="d-flex justify-content-start">
          <div class="container">
              <div class="row">
                <div class="col-sm">
                    <div class="order-total">
                      <h4 id=total${order.order_id}>Order Total - $15,00</h4>
                    </div>
                    <form id=form${order.order_id} class="restaurant-form">
                      <input type="text" name="lname" type="number" placeholder="Time for pick up"/><br />
                      <button type="submit" value="Submit">Accept Order</button>
                    </form>
                </div>
              </div>
      <!--Order total-->
          </div>
    `;
  $(contents).appendTo("#orders");
}

//calls information for an order to give to addOrderContent to append contents to order header
function addAllContent(orderId) {
  $.ajax({
    method: "GET",
    url: `/api/orders/${orderId}`
  }).done(order => {
    var total = 0;
    for (contents of order) {
      //order is quantity, price, name, img, orders.id
      addOrderContent(contents);
      total += Number(contents.quantity) * Number(contents.price);
    }
    $(`#total${orderId}`).text(`Order Total: $${total.toFixed(2)}`);
  });
}

// Creates html structure in restaurant page
function addOrderContent(details) {
  let orderItems = `
    <div class="row">
                <div class="col-12 col-md-2"><img class="order-item-image" src=".${details.img}" /></div>
                <div class="col-12 col-md-6 ">
                  <p class="order-item-name">${details.name}</p>
                </div>
                <div class="col-12 col-md-2"><p class="order-item-quantity">Qty ${details.quantity}</p></div>
                <div class="col-12 col-md-2"><p class="order-item-price">$${(
                  Number(details.quantity) * Number(details.price)
                ).toFixed(2)}</p></div>
              </div>`;
  return $(`#items${details.id}`).append(orderItems);
}

$(() => {
  //gets an array of order_id, guest_name, phone
  $.ajax({
    method: "GET",
    url: "/api/orders"
  })
    .done(orders => {
      for (order of orders) {
        addOrderHeader(order); //adds all headers for the orders
        addAllContent(order.order_id); //adds all content to order headers
      }
    })
    .then(() => {
      $(".restaurant-form").on("submit", event => {
        event.preventDefault();
        let pickUpTime = $(event.target)
          .children("input")
          .val();
        let orderId = $(event.target)
          .attr("id")
          .replace("form", "");
        $.post("/restaurant/", { id: orderId, pickUpTime: pickUpTime })
          .done(() => {
            $(`#total${orderId}`).text("Order confirmed, customer has been texted");
          })
          .fail(err => {
            console.error("Post failed");
          });
      });
    });

  // Accordion functionality for orders
  $(".accordion").on("click", ".accordion-header", function() {
    $(this)
      .toggleClass("active")
      .next()
      .slideToggle();
  });
});
