import { createClient } from 'npm:@supabase/supabase-js@2';
console.log('Hello from Functions!');
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
Deno.serve(async (req)=>{
  const payload = await req.json();
  const { data } = await supabase.from('tokens').select('token').in('user_id',payload.record.user_id)
	let tokenList:(string|null)[] = []
  if(data){
    tokenList = data.map(item => item.token);
  }

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`
    },
    body: JSON.stringify({
      to: tokenList,
      sound: 'default',
      title:payload.record.title,
      body: payload.record.body,
      data:{url:payload.record.data},
    })
  }).then((res)=>{
    res.json();
  });
  return new Response(JSON.stringify(res), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
});
