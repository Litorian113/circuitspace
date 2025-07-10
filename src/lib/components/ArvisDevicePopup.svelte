<script lang="ts">
  import { fly } from 'svelte/transition';

  export let show = false;

  function handleClose() {
    show = false;
  }

  function handleConnect() {
    // Handle connection logic here
    console.log("Connecting to Arvis device...");
    handleClose();
  }
</script>

{#if show}
<div class="popup-overlay" transition:fly={{ y: 100, duration: 500 }}>
  <div class="popup-content">
    <button class="close-button" on:click={handleClose} aria-label="Close popup">&times;</button>
    <img src="/arvis/arvis_three.png" alt="Arvis Device" class="device-image" />
    <h3 class="popup-title">Arvis Device Detected</h3>
    <button class="connect-button" on:click={handleConnect}>Connect</button>
  </div>
</div>
{/if}

<style>
  .popup-overlay {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 10000;
    background: rgba(25, 25, 25, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    color: #fff;
    font-family: 'Inter', sans-serif;
  }

  .popup-content {
    padding: 2rem;
    text-align: center;
    position: relative;
    width: 280px;
  }

  .close-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .close-button:hover {
    color: #fff;
  }

  .device-image {
    width: 150px;
    margin-bottom: 1rem;
    animation: float 3s ease-in-out infinite;
  }

  .popup-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #ECF65F;
    margin: 0 0 1rem 0;
  }

  .connect-button {
    background: #CABDF5;
    color: #191919;
    border: none;
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
  }

  .connect-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(202, 189, 245, 0.3);
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
</style>
