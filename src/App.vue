<script setup lang="ts">
import { ref } from 'vue';

let signedIn = ref(false);
let phoneNumber = ref('');
let order = ref('');
let driverNumber = ref('');

async function placeOrder(newOrder: string) {
  fetch('http://localhost:3000/orders', {
    method: 'post',
    body: JSON.stringify({client_number: phoneNumber.value})
  })
    .then(resp => resp.json())
    .then((resp: any) => {
      console.log(resp)
      driverNumber.value = resp.driver_number;
      order.value = newOrder;
    })
}
</script>

<template>
  <div v-if="signedIn">
    <div v-if="order" class="container mx-auto">
      <div class="flex justify-center">
        <div>
          <span class="material-symbols-outlined font-bold text-6xl text-green-900">
            check_circle
          </span>
        </div>
      </div>
      <h1 class="text-center text-2xl font-bold">Your order has been placed.</h1>
      
      <div class="text-center">If you need to contact your driver, you can call them at {{ driverNumber }}</div>

      <div class="my-2 p-4 border hover:bg-sky-500 hover:text-white hover:font-bold cursor-pointer">
        <a v-bind:href="'sms:+' + driverNumber + '&body='">Send an SMS to your driver</a>
      </div>

      <div class="my-2 p-4 border hover:bg-sky-500 hover:text-white hover:font-bold cursor-pointer">
        <a v-bind:href="'tel:+' + driverNumber">Call your driver</a>
      </div>
    </div>

    <div v-else class="container mx-auto justify-center">
      <h1 class="text-center text-2xl font-bold">Where do you want to order from?</h1>
      <div>
        <iframe class="mx-auto" width="425" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://www.openstreetmap.org/export/embed.html?bbox=-73.99249076843263%2C40.75397045580331%2C-73.9814615249634%2C40.76058575307981&amp;layer=mapnik" style="border: 1px solid black"></iframe>
      </div>

      <div class="block">
        <h2 class="text-xl font-bold">Available Food</h2>
        <ul>
          <li class="my-2 p-4 border hover:bg-sky-500 hover:text-white hover:font-bold cursor-pointer" @click="placeOrder('pizza')">Vesuvius Pizza - Large Pepperoni, $14.95</li>
          <li class="my-2 p-4 border hover:bg-sky-500 hover:text-white hover:font-bold cursor-pointer" @click="placeOrder('hamburger')">Worth-A-Try Burgers, Double Hambuger Meal - $9.95</li>
          <li class="my-2 p-4 border hover:bg-sky-500 hover:text-white hover:font-bold cursor-pointer" @click="placeOrder('salad')">The Lentil Institution - Large Salad - $9.95</li>
        </ul>
      </div>
    </div>
  </div>

  <div v-else class="container mx-auto">
    <div class="flex justify-center">
      <div>
        <span class="material-symbols-outlined font-bold text-6xl">
          lunch_dining
        </span>
      </div>
    </div>

    <div class="flex justify-center">
      <div>
        <h1 class="font-bold text-3xl">Welcome back!</h1>
      </div>
    </div>

    <div class="flex justify-center">
      <label class="block">
        <div class="block">Please sign in with your telephone number</div>
        <div class="flex">
          <span class="inline-flex items-center px-3 text-sm text-stone-50 bg-sky-500 rounded-l-md ">+1</span>
          <input type="text" id="txt-phone-number" class="flex-1 block w-full rounded-l-none rounded-r-md border-gray-300 shadow-sm" v-model="phoneNumber"/>        
        </div>
      </label>
    </div>

    <div class="flex justify-center">
      <div class="block">
        <button id="btn-sign-in" @click="signedIn = true" class="w-full bg-sky-600 m-1 p-2 rounded-md text-white">Sign In</button>
      </div>
    </div>
    
  </div>
</template>
