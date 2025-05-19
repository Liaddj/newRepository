'use strict'

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); 
}

function openModal(selector) {
  const elModal = document.querySelector(selector)
  elModal.classList.remove('hidden')
}

function closeModal(selector) {
  const elModal = document.querySelector(selector)
  elModal.classList.add('hidden')
}