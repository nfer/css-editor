<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import forkMe from 'fork-me-github';

@Component({
  components: {
  },
})
export default class ForkMe extends Vue {
  created() {
    forkMe('https://github.com/nfer/css-editor', {
      background: 'gray',
    });
  }
}
</script>
