import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import OIHLogo from '../resources/OIH_header.png'

export default function Header() {
    return (
        <div>
            <Navbar variant="light" expand="lg">
              <Container id="NavContainer">
                <Navbar.Brand href="/"><img id='headerLogo' src={OIHLogo}/></Navbar.Brand>
                {/*<Navbar.Toggle aria-controls="basic-navbar-nav" />*/}
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="justify-content-end flex-grow-1 pe-3">
                    <Nav.Link className="text-light" href="/">HOME</Nav.Link>
                    <Nav.Link className="text-light" href="/">ABOUT</Nav.Link>
                    <Nav.Link className="text-light" href="/">FAQ</Nav.Link>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
        </div>
    )
}