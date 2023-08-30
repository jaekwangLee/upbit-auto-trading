class Subject {
  registerObserver(observer) {}
  removeObserver(observer) {}
  notifyObserver() {}
}

class Observer {
  update() {}
}

export { Subject, Observer }