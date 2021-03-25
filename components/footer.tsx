import Language from '@material-ui/icons/Language'
import Code from '@material-ui/icons/Code'

import styles from '../styles/footer.module.css'
import { primary, gray } from '../lib/colors'

export default function footer() {
  return (
    <footer className={styles.footer} style={{ backgroundColor: primary }}>
      <div
        className="text-center"
        style={{
          backgroundColor: gray,
        }}
      >
        <p>
          © 2021{' '}
          <strong>
            <a href="https://arbeitskreis.video/">AK Video</a>
          </strong>
        </p>
      </div>

      <div>
        <ul className="list-unstyled list-inline text-center">
          <li className="list-inline-item">
            <a
              href="https://arbeitskreis.video/"
              className="btn-floating btn-fb mx-1"
            >
              <Language></Language>
            </a>
          </li>
          <li className="list-inline-item">
            <a
              className="btn-floating btn-tw mx-1"
              href="https://github.com/layaxx/"
            >
              <Code></Code>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
