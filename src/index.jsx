import React from 'react'
import {render} from 'react-dom'
import {renderToString} from 'react-dom/server'
import * as d3 from 'd3'
import d3cloud from 'd3-cloud'
import kuromoji from 'kuromoji'

const text = `
戦後70年という大きな節目を過ぎ，2年後には，平成30年を迎えます。
私も80を越え，体力の面などから様々な制約を覚えることもあり，ここ数年，天皇としての自らの歩みを振り返るとともに，この先の自分の在り方や務めにつき，思いを致すようになりました。
本日は，社会の高齢化が進む中，天皇もまた高齢となった場合，どのような在り方が望ましいか，天皇という立場上，現行の皇室制度に具体的に触れることは控えながら，私が個人として，これまでに考えて来たことを話したいと思います。

即位以来，私は国事行為を行うと共に，日本国憲法下で象徴と位置づけられた天皇の望ましい在り方を，日々模索しつつ過ごして来ました。伝統の継承者として，これを守り続ける責任に深く思いを致し，更に日々新たになる日本と世界の中にあって，日本の皇室が，いかに伝統を現代に生かし，いきいきとして社会に内在し，人々の期待に応えていくかを考えつつ，今日に至っています。

そのような中，何年か前のことになりますが，2度の外科手術を受け，加えて高齢による体力の低下を覚えるようになった頃から，これから先，従来のように重い務めを果たすことが困難になった場合，どのように身を処していくことが，国にとり，国民にとり，また，私のあとを歩む皇族にとり良いことであるかにつき，考えるようになりました。既に80を越え，幸いに健康であるとは申せ，次第に進む身体の衰えを考慮する時，これまでのように，全身全霊をもって象徴の務めを果たしていくことが，難しくなるのではないかと案じています。

私が天皇の位についてから，ほぼ28年，この間かん私は，我が国における多くの喜びの時，また悲しみの時を，人々と共に過ごして来ました。私はこれまで天皇の務めとして，何よりもまず国民の安寧と幸せを祈ることを大切に考えて来ましたが，同時に事にあたっては，時として人々の傍らに立ち，その声に耳を傾け，思いに寄り添うことも大切なことと考えて来ました。天皇が象徴であると共に，国民統合の象徴としての役割を果たすためには，天皇が国民に，天皇という象徴の立場への理解を求めると共に，天皇もまた，自らのありように深く心し，国民に対する理解を深め，常に国民と共にある自覚を自らの内に育てる必要を感じて来ました。こうした意味において，日本の各地，とりわけ遠隔の地や島々への旅も，私は天皇の象徴的行為として，大切なものと感じて来ました。皇太子の時代も含め，これまで私が皇后と共に行おこなって来たほぼ全国に及ぶ旅は，国内のどこにおいても，その地域を愛し，その共同体を地道に支える市井しせいの人々のあることを私に認識させ，私がこの認識をもって，天皇として大切な，国民を思い，国民のために祈るという務めを，人々への深い信頼と敬愛をもってなし得たことは，幸せなことでした。

天皇の高齢化に伴う対処の仕方が，国事行為や，その象徴としての行為を限りなく縮小していくことには，無理があろうと思われます。また，天皇が未成年であったり，重病などによりその機能を果たし得なくなった場合には，天皇の行為を代行する摂政を置くことも考えられます。しかし，この場合も，天皇が十分にその立場に求められる務めを果たせぬまま，生涯の終わりに至るまで天皇であり続けることに変わりはありません。
天皇が健康を損ない，深刻な状態に立ち至った場合，これまでにも見られたように，社会が停滞し，国民の暮らしにも様々な影響が及ぶことが懸念されます。更にこれまでの皇室のしきたりとして，天皇の終焉に当たっては，重い殯もがりの行事が連日ほぼ2ヶ月にわたって続き，その後喪儀そうぎに関連する行事が，1年間続きます。その様々な行事と，新時代に関わる諸行事が同時に進行することから，行事に関わる人々，とりわけ残される家族は，非常に厳しい状況下に置かれざるを得ません。こうした事態を避けることは出来ないものだろうかとの思いが，胸に去来することもあります。

始めにも述べましたように，憲法の下もと，天皇は国政に関する権能を有しません。そうした中で，このたび我が国の長い天皇の歴史を改めて振り返りつつ，これからも皇室がどのような時にも国民と共にあり，相たずさえてこの国の未来を築いていけるよう，そして象徴天皇の務めが常に途切れることなく，安定的に続いていくことをひとえに念じ，ここに私の気持ちをお話しいたしました。
国民の理解を得られることを，切に願っています。
`

const stopWords = new Set([
  'あと',
  'ある',
  'いく',
  'いたす',
  'いる',
  '菅',
  'ここ',
  'こと',
  'これ',
  'する',
  'せい',
  'そう',
  'たび',
  'ため',
  'ない',
  'なす',
  'とる',
  'なる',
  'もつ',
  'もと',
  'もの',
  'よう',
  'られる',
  'れる',
  '，',
  '*'
])

const pos = new Set(['名詞', '動詞', '形容詞'])

const fontFamily = 'hkkaikk'

class App extends React.Component {
  render () {
    const {words, width, height} = this.props
    const color = d3.scaleOrdinal(d3.schemeCategory20)
    const svg = <svg ref='svg' xmlns='http://www.w3.org/2000/svg' width={width} height={height}>
      <rect width={width} height={height} fill='#fff' />
      <g transform={`translate(${width / 2},${height / 2})`}>{
        words.map((word) => {
          const {text, x, y, rotate, size} = word
          return <text
            key={text}
            fill={color(text)}
            transform={`translate(${x},${y})rotate(${rotate})`}
            fontSize={`${size}px`}
            fontFamily={fontFamily}
            textAnchor='middle'
            stroke='none'
          >
            {text}
          </text>
        })
      }</g>
    </svg>
    return <div>
      <div>
        {svg}
      </div>
      <div>
        <textarea value={renderToString(svg)} onChange={() => {}} />
      </div>
    </div>
  }
}

kuromoji.builder({dicPath: 'dict'}).build((_, tokenizer) => {
  const wordCount = new Map()
  for (const word of tokenizer.tokenize(text)) {
    if (stopWords.has(word.basic_form) | !pos.has(word.pos)) {
      continue
    }
    if (!wordCount.get(word.basic_form)) {
      wordCount.set(word.basic_form, 0)
    }
    wordCount.set(word.basic_form, wordCount.get(word.basic_form) + 1)
  }
  const words = Array.from(wordCount.entries()).map(([text, count]) => ({text, count}))
  words.sort((w1, w2) => w2.count - w1.count)
  const width = 1280
  const height = 720
  const sizeScale = d3.scaleLinear()
    .domain(d3.extent(words, ({count}) => count))
    .range([18, 200])
  d3cloud()
    .size([width, height])
    .words(words)
    .padding(2)
    .rotate(() => 0)
    .font(fontFamily)
    .fontSize(({count}) => sizeScale(count))
    .on('end', (result) => {
      render(<App width={width} height={height} words={result} />, document.getElementById('content'))
    })
    .start()
})
