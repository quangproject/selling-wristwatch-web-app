const totalPrice = document.getElementById('total-price')
// const item = document.getElementsByClassName('item')
const items = document.getElementsByClassName('item');
const itemsArray = Array.from(items);

function changeQuantity(id, action) {
    const quantity = document.getElementById('quantity_' + id)
    if (quantity.textContent === '1' && action === 'minus') {
        return
    } else {
        $('body').append('<div class="overlay"><div class="dot-spinner center"><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div></div></div>')
        $.ajax({
            url: '/api/cart/' + id,
            type: 'PUT',
            data: {
                id: id,
                action: action
            },
            success: function (response) {
                $('.overlay').remove()
                quantity.textContent = response.cart.quantity

                const watchPrice = document.getElementById('watchPrice_' + id)
                if (action === 'plus') {
                    // $sum = parseFloat(subTotal.textContent) + parseFloat(watchPrice.textContent)
                    // subTotal.textContent = $sum
                    var total = parseFloat(totalPrice.textContent) + parseFloat(watchPrice.textContent)
                    totalPrice.textContent = total
                } else {
                    // $minus = parseFloat(subTotal.textContent) - parseFloat(watchPrice.textContent)
                    // subTotal.textContent = $minus
                    var total = parseFloat(totalPrice.textContent) - parseFloat(watchPrice.textContent)
                    totalPrice.textContent = total
                }
            },
            error: function (error) {
                $('.overlay').remove()
                console.error(error);
                if (error.status === 400) {
                    Swal.fire(
                        'Warning',
                        error.responseJSON.message,
                        'warning'
                    )
                }
                if (error.status === 500) {
                    Swal.fire(
                        'Error',
                        error.responseJSON.message,
                        'error'
                    )
                }
            }
        })
    }
}

// Remove item from cart
function removeItem(user_id, id) {
    const quantity = document.getElementById('quantity_' + id)
    const watchPrice = document.getElementById('watchPrice_' + id)

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success me-2',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
        'icon': 'question',
        'title': 'Are you sure?',
        'text': 'This item will be deleted',
        'showCancelButton': true,
        'confirmButtonText': 'Yes, delete it',
        'cancelButtonText': 'No, keep it'
    }).then((result) => {
        if (result.isConfirmed) {
            $('body').append('<div class="overlay"><div class="dot-spinner center"><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div><div class="dot-spinner__dot"></div></div></div>')
            // DELETE A BRAND AJAX
            const path = '/api/cart/' + id;
            $.ajax({
                url: path,
                type: 'DELETE',
                data: {
                    user_id: user_id
                },
                success: function (response) {
                    $('.overlay').remove()
                    Swal.fire({
                        'icon': 'success',
                        'title': response.message,
                        'showConfirmButton': false,
                        'timer': 2000
                    })

                    var el = document.getElementById('cart_' + id)
                    $(el)
                        .closest('#cart_' + id)
                        .css('background', '#f27474')
                        .closest('#cart_' + id)
                        .fadeOut(800, function () {
                            $('#cart_' + id).remove()
                        })

                    const cartCount = document.getElementById('cart-count');
                    let count = cartCount.textContent;
                    count--;
                    cartCount.textContent = count;

                    itemsArray.forEach(item => {
                        item.textContent = count
                    });

                    var total = parseFloat(totalPrice.textContent) - (parseFloat(watchPrice.textContent) * parseFloat(quantity.textContent))
                    totalPrice.textContent = total

                    if (total == 0) {
                        const cart = document.getElementById('cart')
                        cart.innerHTML = `
                            <div class="row">
                                <div class="text-center">
                                    <img src="/img/shopping-bag.gif" alt="Empty cart" style="width: 50%">
                                </div>
                                <div class="text-center my-3">
                                    <a href="/shop" class="btn btn-danger">Continue shopping</a>
                                </div>
                            </div>
                        `
                    }
                },
                error: function (error) {
                    $('.overlay').remove()
                    console.error(error);
                    if (error.status === 400) {
                        Swal.fire(
                            'Warning',
                            error.responseJSON.message,
                            'warning'
                        )
                    }
                    if (error.status === 500) {
                        Swal.fire(
                            'Error',
                            error.responseJSON.message,
                            'error'
                        )
                    }
                }
            })
        }
    })
}